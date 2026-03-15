import { Observable } from 'rxjs';
import { TableColumn } from '../table-column/table-column';
import { TableColumnSetting } from './table-column-setting';

export interface TableSettingsSource {

  /**
   * indicate the source columns are loaded or not
   */
  loaded$: Observable<boolean | undefined>;

  /**
   * Available columns for the table
   */
  availableColumns$: Observable<TableColumn[]> | undefined;

  /*
   * The default table columns string[]
   */
  defaultColumns: string[] | undefined;

  /*
   * The default table columns derived from the defaultColumns$ and availableColumns$
   */
  defaultTableColumns$: Observable<TableColumn[]> | undefined;

  /**
   * Columns to display in the table
   */
  displayedColumns$: Observable<string[]> | undefined;

  /**
   * The table columns to display in the table.
   */
  displayedTableColumns$: Observable<TableColumn[]> | undefined;

  /**
   * The table columns to display in the table.
   */
  tableColumnSettings$: Observable<TableColumnSetting[]> | undefined;

  /**
   * Set by the source. Not currently used but very useful for debugging.
   */
  tableSettingsName?: string;

  /**
   * Set the table columns (used to determine available columns)
   * @param tableColumns
   */
  setAvailableColumns(tableColumns: TableColumn[]): void;

  updateDisplayedColumns?(displayedColumns: string[] | null): void;

  updateUserTableColumns(userTableColumns: TableColumn[]): void;
}
