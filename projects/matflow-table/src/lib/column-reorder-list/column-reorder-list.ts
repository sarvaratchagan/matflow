import { Directive, OnInit, Optional } from '@angular/core';
import { CdkDropList } from '@angular/cdk/drag-drop';
import { ColumnReorderDirective } from '../column-reorder/column-reorder';
import { TableColumn } from '../table-column/table-column';

/**
 * Bridge directive that connects Angular CDK's CdkDropList
 * with the Matflow column reorder system.
 *
 * Responsibilities:
 * - Captures the CdkDropList instance from the template
 * - Registers it with the parent ColumnReorderDirective
 * - Keeps drag-drop wiring fully declarative
 *
 * Why this exists:
 * - CdkDropList lives on the header row (<tr>)
 * - ColumnReorderDirective lives on the table container
 * - This directive bridges that structural gap cleanly
 *
 * Design goals:
 * - Avoid manual wiring in components
 * - Keep directives loosely coupled
 * - Enable reusable, plug-and-play behavior
 *
 * Usage:
 *   <table
     mat-table
     [dataSource]="data"
     cdkDropList
     [cdkDropListData]="userTable.displayedTableColumns$ | async"
     cdkDropListOrientation="horizontal"
     matflowColumnReorderList>
    </table>
 */
@Directive({
  selector: '[matflowColumnReorderList]',
  exportAs: 'matflowColumnReorderList',
  standalone: false
})
export class ColumnReorderListDirective implements OnInit {

  constructor(
    /**
     * Injects the CdkDropList attached to the host element.
     *
     * This directive must be used alongside `cdkDropList`.
     */
    private readonly dropList: CdkDropList<TableColumn[]>,

    /**
     * Parent reorder directive.
     *
     * Optional to keep directive fail-safe if used without
     * matflowColumnReorder.
     */
    @Optional() private readonly reorder: ColumnReorderDirective
  ) {}

  /**
   * Lifecycle hook:
   * Registers the drop list with the parent reorder directive.
   *
   * Flow:
   * - If reorder directive exists → register drop list
   * - Otherwise → warn developer (misconfiguration)
   */
  ngOnInit(): void {
    if (!this.reorder) {
      console.warn('[matflowColumnReorderList] No parent reorder directive found');
      return;
    }

    this.reorder.registerDropList(this.dropList);
  }
}
