import { InjectionToken } from '@angular/core';
import { TableColumnSettingsAdapter } from './table-column-settings-adapter';

/**
 * Injection token used to provide a concrete implementation
 * of TableColumnSettingsAdapter.
 *
 * Why this is needed:
 * - Angular DI cannot inject abstract classes/interfaces directly
 * - This token acts as a bridge between the Facade and the actual implementation
 *
 * Usage:
 * Provide this token in your module or component:
 *
 * {
 *   provide: TABLE_COLUMN_SETTINGS_ADAPTER,
 *   useClass: YourAdapterImplementation
 * }
 *
 * Example implementations:
 * - LocalStorage adapter
 * - HTTP API adapter
 * - IndexedDB adapter
 */
export const TABLE_COLUMN_SETTINGS_ADAPTER =
  new InjectionToken<TableColumnSettingsAdapter>(
    'TABLE_COLUMN_SETTINGS_ADAPTER'
  );
