import {
  AfterContentInit,
  ContentChildren,
  Directive,
  EventEmitter,
  Inject,
  Optional,
  Output,
  QueryList
} from '@angular/core';

import { firstValueFrom, map, Observable } from 'rxjs';

import { TableColumnDirective, TableColumn } from '../table-column/table-column';
import { TABLE_SETTINGS_SOURCE } from '../table/table-settings-source.token';
import { TableSettingsSource } from '../table/table-settings-source';
import { TableColumnSetting } from '../table/table-column-setting';

@Directive({
  selector: '[matflowTableColumns]',
  exportAs: 'matflowTableColumns',
  standalone: false
})
export class TableColumnsDirective<T> implements AfterContentInit {

  /**
   * Emits all detected columns
   */
  @Output()
  matflowTableColumnsChange = new EventEmitter<TableColumn[]>();


  /**
   * All projected column directives
   */
  @ContentChildren(TableColumnDirective, { descendants: false })
  columns!: QueryList<TableColumnDirective<T>>;


  constructor(
    @Optional()
    @Inject(TABLE_SETTINGS_SOURCE)
    private tableSettingsSource?: TableSettingsSource
  ) {}


  async ngAfterContentInit(): Promise<void> {

    const cols: TableColumn[] = await Promise.all(
      this.columns.map(async column => {

        const meta = column.meta;

        return {
          field: meta.name,
          label: meta.label,
          alias: await firstValueFrom(column.alias$),

          queryable: meta.queryable,
          groupable: meta.groupable,

          readonly: meta.viewonly,
          required: meta.required,
          hidden: meta.hidden
        };

      })
    );

    /**
     * Emit column definitions
     */
    this.matflowTableColumnsChange.emit(cols);


    /**
     * Register available columns to settings source
     */
    this.tableSettingsSource?.setAvailableColumns(cols);
  }


  /**
   * Returns user column setting
   */
  userSetting(
    columnName: string
  ): Observable<TableColumnSetting | undefined> | undefined {

    if (!this.tableSettingsSource?.tableColumnSettings$) {
      return undefined;
    }

    return this.tableSettingsSource.tableColumnSettings$.pipe(
      map(settings =>
        settings.find(s => s.name === columnName)
      )
    );
  }
}
