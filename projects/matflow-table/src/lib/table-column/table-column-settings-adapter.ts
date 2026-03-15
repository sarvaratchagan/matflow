import { Observable } from 'rxjs';
import { TableColumnSetting } from '../table/table-column-setting';

export abstract class TableColumnSettingsAdapter {

  abstract load(
    tableName: string
  ): Observable<TableColumnSetting[] | undefined>;

  abstract save(
    tableName: string,
    columns: TableColumnSetting[]
  ): Observable<TableColumnSetting[]>;

}
