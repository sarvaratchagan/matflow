import {
  AfterContentInit,
  ContentChildren,
  Directive,
  EventEmitter, Host,
  Optional,
  Output,
  QueryList
} from '@angular/core';

import { defaultIfEmpty, firstValueFrom, take } from 'rxjs';

import { TableColumnDirective, TableColumn } from '../table-column/table-column';
import { MatflowTableDirective } from '../table/matflow-table';

/**
 * Directive responsible for:
 * - Collecting projected column definitions (<ng-content>)
 * - Transforming them into TableColumn models
 * - Registering them with MatflowTable
 *
 * Works as a bridge between:
 * Template-driven column definitions → Table system
 */
@Directive({
  selector: '[matflowTableColumns]',
  exportAs: 'matflowTableColumns',
  standalone: false
})
export class TableColumnsDirective<T> implements AfterContentInit {

  /**
   * Emits all detected columns
   * Useful for external listeners (optional)
   */
  @Output()
  matflowTableColumnsChange = new EventEmitter<TableColumn[]>();

  /**
   * All projected column directives
   *
   * Example usage:
   * <ng-container matflowColumn="name">...</ng-container>
   */
  @ContentChildren(TableColumnDirective, { descendants: true })
  columns!: QueryList<TableColumnDirective<T>>;

  constructor(
    /**
     * Parent MatflowTable (optional to allow standalone usage)
     */
    @Optional() @Host() private table?: MatflowTableDirective
  ) {}

  /**
   * Lifecycle hook triggered after content projection is ready
   *
   * Responsible for:
   * - Reading column metadata
   * - Resolving async alias values
   * - Building TableColumn objects
   * - Emitting + registering columns
   */
  async ngAfterContentInit(): Promise<void> {

    /**
     * Build column definitions from projected directives
     */
    const cols: TableColumn[] = await Promise.all(
      this.columns.map(async column => {
        const meta = column.meta;

        return {
          /**
           * Unique field identifier
           */
          field: meta.name,

          /**
           * Static label from metadata
           */
          label: meta.label,

          /**
           * Alias (can be async — resolved from observable)
           * Falls back to field name if empty
           */
          alias: await firstValueFrom(
            column.alias$.pipe(
              take(1),
              defaultIfEmpty(meta.name)
            )
          ),

          /**
           * Feature flags
           */
          queryable: meta.queryable,
          groupable: meta.groupable,

          /**
           * Derived flags
           */
          readonly: meta.computed,
          required: meta.required,
          hidden: meta.hidden
        };
      })
    );

    /**
     * Emit columns for external consumers
     */
    this.matflowTableColumnsChange.emit(cols);

    /**
     * Register columns with parent table (if available)
     */
    if (this.table) {
      this.table.registerColumns(cols);
    }
  }
}
