import { InjectionToken } from '@angular/core';
import { TableColumnSettingsAdapter } from './table-column-settings-adapter';

export const TABLE_COLUMN_SETTINGS_ADAPTER =
  new InjectionToken<TableColumnSettingsAdapter>(
    'TABLE_COLUMN_SETTINGS_ADAPTER'
  );
