import { AfterContentInit, Directive, Inject, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, combineLatest, Observable, ReplaySubject, Subject, take, takeUntil, tap } from 'rxjs';
import { filter, map, shareReplay, switchMap } from 'rxjs/operators';

import { TableColumnSettingsAdapter } from '../table-column/table-column-settings-adapter';
import { TABLE_COLUMN_SETTINGS_ADAPTER} from '../table-column/table-column-settings.token';
import { TABLE_SETTINGS_SOURCE } from './table-settings-source.token';
import { TableColumn } from '../table-column/table-column';
import { TableSettingsSource } from './table-settings-source';
import { TableColumnSetting } from './table-column-setting';

export class MatflowTableSettings implements TableSettingsSource {
  private availableColumnsSubject = new ReplaySubject<TableColumn[]>(1);

  settingLoadedSubject = new ReplaySubject<boolean | undefined>(1);

  availableColumns$ = this.availableColumnsSubject.asObservable().pipe(
    filter((tableColumns: TableColumn[]) => !!tableColumns),
    map((tableColumns: TableColumn[]) =>
      tableColumns
        ?.filter(tableColumn => !!tableColumn)
        ?.sort((tableColumn1: TableColumn, tableColumn2: TableColumn) => (tableColumn1?.label ?? '')?.localeCompare((tableColumn2?.label ?? ''))
      )
    )
  );

  loaded$ = this.settingLoadedSubject.asObservable();

  defaultColumns: string[] = [];

  defaultTableColumns$ = this.availableColumns$.pipe(
    map((availableTableColumns: TableColumn[]) => {
      return this.defaultColumns.map((defaultColumn) =>
        availableTableColumns
          ?.find(
          (availableTableColumn: TableColumn) => availableTableColumn.field === defaultColumn
        )
      )?.filter(tableColumn => !!tableColumn);
    })
  );

  displayedColumnsSubject = new ReplaySubject<string[]>(1);

  displayedColumns$ = this.displayedColumnsSubject.asObservable();

  tableColumnSettings$: Observable<TableColumnSetting[]> | undefined;

  displayedTableColumns$: Observable<TableColumn[]> | undefined;

  private updatedTableColumnsSettingsSubject = new ReplaySubject<TableColumn[]>(
    1
  );
  updatedTableColumns$ = this.updatedTableColumnsSettingsSubject.asObservable();

  tableSettingsName?: string;

  setAvailableColumns(tableColumns: TableColumn[]): void {
    this.availableColumnsSubject.next(tableColumns);
  }

  updateUserTableColumns(userTableColumns: TableColumn[]) {
    this.updatedTableColumnsSettingsSubject.next(userTableColumns);
  }
}

@Directive({
  selector: '[matflowTable]',
  exportAs: 'matflowTable',
  standalone: false
})
export class TableDirective implements OnInit, AfterContentInit, OnDestroy {

  private destroy$ = new Subject<void>();

  @Input() tableSettingName: string | undefined;

  @Input()
  set defaultColumns(value: string[] | undefined) {
    this.tableSettingsSource.defaultColumns = value as string[];
  }

  get defaultColumns(): string[] | undefined {
    return this.tableSettingsSource.defaultColumns;
  }

  displayedColumns$!: Observable<string[]>;
  displayedTableColumns$!: Observable<TableColumn[]>;

  loadingSubject = new ReplaySubject<boolean | undefined>(1);
  loading$ = this.loadingSubject.asObservable();

  private tableColumnSettingsSubject =
    new BehaviorSubject<TableColumnSetting[] | undefined>(undefined);

  tableColumnSettings$ = this.tableColumnSettingsSubject.asObservable();

  constructor(
    @Inject(TABLE_COLUMN_SETTINGS_ADAPTER)
    private columnAdapter: TableColumnSettingsAdapter,
    @Inject(TABLE_SETTINGS_SOURCE)
    public tableSettingsSource: MatflowTableSettings,
    private matSnackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tableSettingsSource.tableSettingsName = this.tableSettingName;
  }

  ngAfterContentInit(): void {

    if (!this.tableSettingName) return;

    this.tableSettingsSource.tableColumnSettings$ = this.tableColumnSettingsSubject.asObservable()?.pipe(
      // TODO type casting problem
      map(columnSettings => columnSettings as TableColumnSetting[])
    );

    this.loadSettings();
    this.setupDisplayedColumns();

    this.tableSettingsSource.updatedTableColumns$
      .pipe(takeUntil(this.destroy$))
      .subscribe(columns => this.updateColumns(columns));
  }

  private loadSettings() {
    this.loadingSubject.next(true);

    this.columnAdapter
      .load(this.tableSettingName as string)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: settings => {
  
          const columns = (settings ?? []).map(column => ({
            ...column,
            displayed: true
          }));
  
          this.tableColumnSettingsSubject.next(columns);
  
          this.tableSettingsSource.settingLoadedSubject.next(true);
          this.loadingSubject.next(false);
        },
  
        error: () => this.loadingSubject.next(false)
      });
  
    this.tableSettingsSource.tableColumnSettings$ =
      this.tableSettingsSource.loaded$?.pipe(
        filter(Boolean),
        switchMap(() => this.tableColumnSettings$),
        // TODO type casting problem
        map(columns => columns as TableColumnSetting[])
      );
  }

  private setupDisplayedColumns() {

    this.displayedTableColumns$ = combineLatest([
      this.tableSettingsSource.availableColumns$,
      this.tableColumnSettings$,
      this.tableSettingsSource.defaultTableColumns$
    ]).pipe(
      map(([availableColumns, userSettings, defaultColumns]) => {
        if (!userSettings) {
          return defaultColumns.filter(
            (c): c is TableColumn => !!c
          );
        }

        return userSettings
          .sort((a, b) => a.order - b.order)
          .map(setting => {

            const column = availableColumns.find(
              c => c.field === setting.name
            );

            if (!column) return undefined;

            return {
              ...column,
              alias: setting.alias
            } as TableColumn;

          })
          .filter((c): c is TableColumn => !!c);

      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

    this.tableSettingsSource.displayedTableColumns$ = this.displayedTableColumns$;

    this.displayedColumns$ = this.displayedTableColumns$.pipe(
      map(columns => columns.map(c => c.field)),
      tap(columns =>
        this.tableSettingsSource.displayedColumnsSubject.next(columns)
      ),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  }

  updateColumns(columns: TableColumn[] | null) {

    if (!columns) return;

    const settings: TableColumnSetting[] =
      columns.map((column, index) => ({
        order: index,
        name: column.field,
        alias: column.alias
      }));

    this.loadingSubject.next(true);

    this.columnAdapter
      .save(this.tableSettingName as string, settings)
      .pipe(take(1))
      .subscribe({
        next: updated => {

          this.tableColumnSettingsSubject.next(updated);

          this.matSnackBar.open(
            'Column changes saved',
            'OK',
            { duration: 2000 }
          );

          this.loadingSubject.next(false);

        },
        error: () => this.loadingSubject.next(false)
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
