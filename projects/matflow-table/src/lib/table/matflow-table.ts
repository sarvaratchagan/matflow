import { Directive, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { TableColumn } from '../table-column/table-column';
import { TableColumnSetting } from './table-column-setting';
import { MatflowTableFacade } from '../core/facade/matflow-table.facade';
import { MatflowTableStore } from '../core/store/matflow-table.store';

/**
 * Directive that connects the template layer with the Matflow Table system.
 *
 * Responsibilities:
 * - Accepts inputs (table name, columns, defaults)
 * - Exposes reactive streams for UI binding
 * - Delegates all logic to the Facade
 *
 * Usage:
 * <table matflowTable="users" [availableColumns]="cols" [defaultColumns]="defaults"></table>
 */
@Directive({
  selector: '[matflowTable]',
  exportAs: 'matflowTable',

  /**
   * Provides a scoped instance of Store + Facade per directive instance.
   *
   * This ensures:
   * - Each table has isolated state
   * - No cross-table interference
   */
  providers: [MatflowTableStore, MatflowTableFacade],

  standalone: false
})
export class MatflowTableDirective implements OnInit {

  /**
   * Unique identifier for the table.
   *
   * Used for:
   * - Loading persisted settings
   * - Saving user preferences
   */
  @Input('matflowTable') tableName!: string;

  /**
   * Stream of column field names used by mat-table.
   */
  displayedColumns$!: Observable<string[] | undefined>;

  /**
   * Stream of full column definitions used for rendering.
   */
  displayedTableColumns$!: Observable<TableColumn[] | undefined>;

  /**
   * Input: full list of available columns.
   *
   * Delegates to facade.
   */
  @Input()
  set availableColumns(columns: TableColumn[]) {
    this.facade.setAvailableColumns(columns);
  }

  /**
   * Input: default visible column field names.
   *
   * Delegates to facade.
   */
  @Input()
  set defaultColumns(columns: string[]) {
    this.facade.setDefaultColumns(columns);
  }

  constructor(public facade: MatflowTableFacade) {

    // Expose facade streams to template
    this.displayedColumns$ = this.facade.displayedColumns$;
    this.displayedTableColumns$ = this.facade.displayedTableColumns$;
  }

  /**
   * Lifecycle hook: initializes table state.
   *
   * - Validates required input
   * - Triggers loading of persisted settings
   */
  ngOnInit() {
    if (!this.tableName) {
      throw new Error('matflowTable requires tableName');
    }

    this.facade.init(this.tableName);
  }

  /**
   * Updates column settings (order, visibility, alias).
   *
   * Typically triggered from UI interactions.
   */
  updateColumns(columns: TableColumnSetting[] | null) {
    this.facade.updateColumns(columns);
  }

  /**
   * Registers available columns dynamically.
   *
   * Useful when columns are defined programmatically
   * or discovered at runtime.
   */
  registerColumns(columns: TableColumn[]) {
    this.facade.setAvailableColumns(columns);
  }

  reorderColumns(previousIndex: number, currentIndex: number) {
    this.facade.reorderColumns(previousIndex, currentIndex);
  }
}
