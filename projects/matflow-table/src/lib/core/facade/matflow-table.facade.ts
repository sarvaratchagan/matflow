import { Inject, Injectable, OnDestroy } from '@angular/core';
import {
  catchError,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  EMPTY,
  Observable,
  of,
  Subject,
  take,
  takeUntil
} from 'rxjs';
import { map, shareReplay, switchMap } from 'rxjs/operators';

import { TableColumnSetting } from '../../table/table-column-setting';
import { TableColumn } from '../../table-column/table-column';
import { MatflowTableStore } from '../store/matflow-table.store';
import { TABLE_COLUMN_SETTINGS_ADAPTER } from '../adapter/table-column-settings.token';
import { TableColumnSettingsAdapter } from '../adapter/table-column-settings-adapter';

/**
 * Facade responsible for:
 * - Orchestrating table state
 * - Combining store streams into UI-ready data
 * - Handling persistence (load/save column settings)
 */
@Injectable()
export class MatflowTableFacade implements OnDestroy {

  /** Used to clean up subscriptions on destroy */
  private destroy$ = new Subject<void>();

  /** Unique identifier for table (used for persistence) */
  private tableName!: string;

  /** Internal trigger to persist column settings */
  private saveTrigger$ = new Subject<TableColumnSetting[] | null>();

  /** All available columns */
  readonly availableColumns$: Observable<TableColumn[]>;

  /** Default column definitions */
  readonly defaultTableColumns$: Observable<TableColumn[]>;

  /** Persisted column settings */
  readonly tableColumnSettings$: Observable<TableColumnSetting[] | null>;

  /** Default column field names */
  readonly defaultColumns$: Observable<string[]>;

  /** Final columns to be rendered (full objects) */
  readonly displayedTableColumns$: Observable<TableColumn[]>;

  /** Final column field names (used in mat-table) */
  readonly displayedColumns$: Observable<string[]>;

  constructor(
    private store: MatflowTableStore,

    @Inject(TABLE_COLUMN_SETTINGS_ADAPTER)
    private adapter: TableColumnSettingsAdapter
  ) {
    // ================================
    // 🔹 Base streams from store
    // ================================
    this.availableColumns$ = this.store.availableColumns$;
    this.defaultTableColumns$ = this.store.defaultTableColumns$;
    this.tableColumnSettings$ = this.store.tableColumnSettings$;
    this.defaultColumns$ = this.store.defaultColumns$;

    // ================================
    // 🔹 Derived stream: displayed columns
    // Combines:
    // - available columns
    // - default columns
    // - persisted settings
    // ================================
    this.displayedTableColumns$ = combineLatest<
      [
        TableColumn[],
        TableColumn[],
          TableColumnSetting[] | null
      ]>([
      this.availableColumns$,
      this.defaultTableColumns$,
      this.tableColumnSettings$
    ]).pipe(
      map(([available, defaults, settings]) =>
        this.buildDisplayedColumns(available, defaults, settings)
      ),
      // cache latest value for subscribers
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // ================================
    // 🔹 Extract only column field names
    // Used by Angular Material table
    // ================================
    this.displayedColumns$ = this.displayedTableColumns$.pipe(
      map(cols => cols.map(c => c.field)),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    // Initialize save pipeline
    this.handleSave();
  }

  /**
   * Initializes table by loading persisted settings
   */
  init(tableName: string) {
    this.tableName = tableName;

    this.store.setLoading(true);

    this.adapter.load(this.tableName)
      .pipe(
        take(1), // take only initial load
        catchError(() => of([])), // fallback to empty settings
        takeUntil(this.destroy$)
      )
      .subscribe(settings => {
        const normalized = settings?.length
          ? this.normalizeOrder(settings)
          : settings;
        this.store.setTableSettings(normalized);
        this.store.setLoading(false);
      });
  }

  /**
   * Sets all available columns
   */
  setAvailableColumns(columns: TableColumn[]) {
    this.store.setAvailableColumns(columns);
  }

  /**
   * Sets default visible column fields
   */
  setDefaultColumns(columns: string[]) {
    this.store.setDefaultColumns(columns);
  }

  /**
   * Updates column settings and triggers save
   */
  updateColumns(settings: TableColumnSetting[] | null) {
    this.store.setTableSettings(settings);
    this.saveTrigger$.next(settings);
  }

  /**
   * Builds final displayed columns
   *
   * Logic:
   * - If no settings → return defaults
   * - Apply order from settings
   * - Filter only valid available columns
   * - Map alias from settings into column
   */
  private buildDisplayedColumns(
    available: TableColumn[],
    defaults: TableColumn[],
    settings: TableColumnSetting[] | null
  ): TableColumn[] {

    // fallback to default columns if no settings
    if (!settings) {
      return defaults;
    }

    return settings
      .slice() // avoid mutating original array
      .sort((a, b) => a.order - b.order) // apply order
      .filter(setting =>
        // ensure column exists in available list
        available.some(col => col.field === setting.name)
      )
      .map(setting => {
        const col = available.find(c => c.field === setting.name)!;

        return {
          ...col,
          alias: setting.alias // override alias if provided
        } as TableColumn;
      });
  }

  /**
   * Handles auto-save of column settings
   *
   * Features:
   * - Debounced save (300ms)
   * - Prevent duplicate saves
   * - Ignore errors silently
   */
  private handleSave() {
    this.saveTrigger$
      .pipe(
        debounceTime(300),
        distinctUntilChanged((a, b) => this.isEqual(a, b)),
        switchMap(settings =>
          this.adapter.save(this.tableName, settings).pipe(
            catchError(() => EMPTY)
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(saved => {
        // update store with saved result
        this.store.setTableSettings(saved);
      });
  }

  /**
   * Compares two settings arrays to avoid unnecessary saves
   */
  private isEqual(
    prev: TableColumnSetting[] | null,
    next: TableColumnSetting[] | null
  ) {
    if (!prev || !next) return false;
    if (prev.length !== next.length) return false;

    return prev.every((val, i) =>
      val.name === next[i].name &&
      val.order === next[i].order &&
      val.alias === next[i].alias
    );
  }

  /**
   * Reorders columns based on drag & drop indices.
   *
   * Flow:
   * 1. Take current persisted settings (single snapshot)
   * 2. Move item from previousIndex → currentIndex
   * 3. Normalize order to maintain consistency
   * 4. Trigger update + persistence
   */
  reorderColumns(previousIndex: number, currentIndex: number) {
    this.tableColumnSettings$
      .pipe(take(1))
      .subscribe(settings => {
        if (!settings || settings.length === 0) return;

        const updated = [...settings];

        // Move dragged column
        const [moved] = updated.splice(previousIndex, 1);
        updated.splice(currentIndex, 0, moved);

        const normalized = this.normalizeOrder(updated);

        this.updateColumns(normalized);
      });
  }

  /**
   * Returns a one-time snapshot of current column settings.
   * Useful for external integrations or debugging.
   */
  getCurrentSettings(): Observable<TableColumnSetting[] | null> {
    return this.tableColumnSettings$.pipe(take(1));
  }

  /**
   * Ensures column order is sequential and stable.
   *
   * Example:
   * [5, 2, 9] → [0, 1, 2]
   */
  private normalizeOrder(settings: TableColumnSetting[]): TableColumnSetting[] {
    return settings.map((s, index) => ({
      ...s,
      order: index
    }));
  }

  /**
   * Cleanup subscriptions on destroy
   */
  ngOnDestroy() {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
