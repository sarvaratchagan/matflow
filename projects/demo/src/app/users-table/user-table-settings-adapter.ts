import { Injectable } from '@angular/core';
import { TableColumnSettingsAdapter, TableColumnSetting } from 'matflow-table';
import { Observable, of } from 'rxjs';

@Injectable()
export class UserTableSettingsAdapter
  implements TableColumnSettingsAdapter {

  private prefix = 'matflow-table-settings';

  load(
    tableName: string
  ): Observable<TableColumnSetting[] | null> {

    const key = `${this.prefix}-${tableName}`;
    const raw = localStorage.getItem(key);

    if (!raw) {
      return of(null);
    }

    try {
      return of(JSON.parse(raw) as TableColumnSetting[]);
    } catch {
      return of(null);
    }
  }

  save(
    tableName: string,
    columns: TableColumnSetting[] | null
  ): Observable<TableColumnSetting[] | null> {

    const key = `${this.prefix}-${tableName}`;

    localStorage.setItem(
      key,
      JSON.stringify(columns)
    );

    return of(columns);
  }
}
