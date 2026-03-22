import { Observable } from 'rxjs';
import { TableColumnSetting } from '../../table/table-column-setting';

/**
 * Adapter contract for persisting table column settings.
 *
 * This abstraction allows different storage implementations, such as:
 * - LocalStorage
 * - Backend API
 * - IndexedDB
 * - In-memory (for testing)
 *
 * The Facade depends only on this contract, ensuring loose coupling.
 */
export abstract class TableColumnSettingsAdapter {

  /**
   * Loads persisted column settings for a given table.
   *
   * @param tableName Unique identifier for the table
   *
   * @returns Observable emitting:
   * - TableColumnSetting[] → previously saved settings
   * - null → no settings found / not configured
   *
   * Expected behavior:
   * - Should complete after emitting once
   * - Should NOT throw errors (handle internally if possible)
   */
  abstract load(
    tableName: string
  ): Observable<TableColumnSetting[] | null>;

  /**
   * Persists column settings for a given table.
   *
   * @param tableName Unique identifier for the table
   * @param tableColumnSettings Current column configuration
   *
   * @returns Observable emitting:
   * - TableColumnSetting[] → saved/normalized settings
   * - null → if nothing is stored
   *
   * Expected behavior:
   * - Should debounce/throttle externally (Facade handles this)
   * - Should return the final saved state (source of truth)
   * - Should handle errors internally and return safe fallback
   */
  abstract save(
    tableName: string,
    tableColumnSettings: TableColumnSetting[] | null
  ): Observable<TableColumnSetting[] | null>;
}
