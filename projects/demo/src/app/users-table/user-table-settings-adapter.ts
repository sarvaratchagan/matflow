import { Injectable } from '@angular/core';
import { TableColumnSettingsAdapter, TableColumnSetting } from 'matflow-table';
import { Observable, of } from 'rxjs';

@Injectable()
export class UserTableSettingsAdapter
  implements TableColumnSettingsAdapter {

  private prefix = 'matflow-table-settings';

  load(
    tableName: string
  ): Observable<TableColumnSetting[] | undefined> {

    const key = `${this.prefix}-${tableName}`;
    const raw = localStorage.getItem(key);

    if (!raw) {
      return of(undefined);
    }

    try {
      return of(JSON.parse(raw) as TableColumnSetting[]);
    } catch {
      return of(undefined);
    }
  }

  save(
    tableName: string,
    columns: TableColumnSetting[]
  ): Observable<TableColumnSetting[]> {

    const key = `${this.prefix}-${tableName}`;

    localStorage.setItem(
      key,
      JSON.stringify(columns)
    );

    return of(columns);
  }
}
