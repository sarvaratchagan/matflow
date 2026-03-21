import { BehaviorSubject, Observable } from 'rxjs';
import { TableColumnSetting } from '../../table/table-column-setting';
import { TableColumn } from '../../table-column/table-column';
import { map } from 'rxjs/operators';

/**
 * Central reactive store for managing table column configuration.
 *
 * Responsibilities:
 * - Maintain source state (available columns, defaults, settings)
 * - Expose reactive streams for UI consumption
 * - Provide simple setter APIs for updating state
 *
 * This is a lightweight alternative to NgRx/ComponentStore.
 */
export class MatflowTableStore {

  /**
   * Internal state: full list of available columns.
   *
   * Default: empty array
   */
  private availableColumnsSubject = new BehaviorSubject<TableColumn[]>([]);

  /**
   * Public stream of available columns.
   *
   * Behavior:
   * - Always emits a sorted copy (by label)
   * - Prevents mutation of original state
   */
  readonly availableColumns$: Observable<TableColumn[]> =
    this.availableColumnsSubject.asObservable().pipe(
      map((tableColumns): TableColumn[]  => {
        return [...tableColumns].sort((a, b) =>
          (a.label ?? '').localeCompare(b.label ?? '')
        );
      })
    );

  /**
   * Internal state: list of default column field names.
   *
   * Example: ['name', 'age', 'email']
   */
  private defaultColumnsSubject = new BehaviorSubject<string[]>([]);

  /**
   * Public stream of default column field names.
   */
  readonly defaultColumns$ = this.defaultColumnsSubject.asObservable();

  /**
   * Derived stream: resolves default column field names
   * into actual TableColumn objects.
   *
   * Behavior:
   * - Maps default field names → matching available columns
   * - Filters out missing/invalid columns
   * - Falls back to all available columns if defaults not set
   */
  readonly defaultTableColumns$ = this.availableColumns$.pipe(
    map((availableTableColumns) => {
      const defaultColumns = this.defaultColumnsSubject?.value;

      if (defaultColumns) {
        return defaultColumns
          .map((defaultColumn) =>
            (availableTableColumns ?? []).find(
              (availableTableColumn) =>
                availableTableColumn.field === defaultColumn
            )
          )
          .filter((tableColumn) => !!tableColumn); // remove undefined
      } else {
        // fallback: return all available columns
        return availableTableColumns;
      }
    })
  );

  /**
   * Internal loading state.
   *
   * Indicates whether table metadata (columns/settings) is loading.
   *
   * Values:
   * - true  → loading in progress
   * - false → loading completed
   */
  private loadingSubject = new BehaviorSubject<boolean>(false);

  /**
   * Public stream of loading state.
   */
  readonly loading$ = this.loadingSubject.asObservable();

  /**
   * Internal state: persisted/user-defined column settings.
   *
   * Includes:
   * - column order
   * - visibility
   * - alias/custom labels
   *
   * Default: null (no settings loaded yet)
   */
  private tableColumnSettingsSubject = new BehaviorSubject<TableColumnSetting[] | null>(null);

  /**
   * Public stream of table column settings.
   *
   * Behavior:
   * - Emits null if no settings available
   * - Pass-through otherwise
   *
   * Note:
   * This map currently acts as a guard but does not transform data.
   */
  readonly tableColumnSettings$ = this.tableColumnSettingsSubject.asObservable().pipe(
    map(tableSettings => {
      if (!tableSettings) {
        return null;
      }
      return tableSettings;
    })
  );

  /**
   * Updates available columns.
   *
   * Triggers:
   * - availableColumns$
   * - defaultTableColumns$ (derived)
   */
  setAvailableColumns(columns: TableColumn[]) {
    this.availableColumnsSubject.next(columns);
  }

  /**
   * Updates default column field names.
   *
   * Triggers:
   * - defaultColumns$
   * - defaultTableColumns$ (derived)
   */
  setDefaultColumns(columns: string[]) {
    this.defaultColumnsSubject.next(columns);
  }

  /**
   * Updates table column settings.
   *
   * Triggers:
   * - tableColumnSettings$
   */
  setTableSettings(tableSettings: TableColumnSetting[] | null) {
    this.tableColumnSettingsSubject.next(tableSettings);
  }

  /**
   * Updates loading state.
   *
   * @param value true → loading, false → loaded
   */
  setLoading(value: boolean) {
    this.loadingSubject.next(value);
  }
}
