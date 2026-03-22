import { Directive, Host, OnDestroy, Optional } from '@angular/core';
import { MatflowTableDirective } from '../table/matflow-table';
import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { Subject} from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableColumn} from '../table-column/table-column';

/**
 * Directive responsible for enabling column reordering via drag & drop.
 *
 * Responsibilities:
 * - Acts as a bridge between Angular CDK drag-drop and table facade
 * - Listens to drop events from CdkDropList
 * - Delegates reorder logic to MatflowTableDirective
 *
 * Design goals:
 * - Fully declarative usage (no imperative wiring in component)
 * - No direct state mutation (delegates to facade)
 * - Clean lifecycle management (no memory leaks)
 */
@Directive({
  selector: '[matflowColumnReorder]',
  exportAs: 'matflowColumnReorder',
  standalone: false
})
export class ColumnReorderDirective implements OnDestroy {

  /** Emits on destroy to clean up subscriptions */
  private readonly destroy$ = new Subject<void>();

  /**
   * Reference to the registered drop list.
   *
   * Provided by a companion/bridge directive attached to the header row.
   */
  private dropList?: CdkDropList<TableColumn[]>;

  constructor(
    /**
     * Host table directive.
     *
     * Optional to keep directive reusable and fail-safe
     * (no hard dependency if used incorrectly).
     */
    @Host() @Optional() private readonly table: MatflowTableDirective
  ) {}

  /**
   * Registers the CdkDropList instance.
   *
   * This is called by a bridge directive attached to the header row
   * (where `cdkDropList` actually lives).
   *
   * Responsibilities:
   * - Store reference to drop list
   * - Subscribe to drop events
   * - Forward valid events to handler
   */
  registerDropList(dropList: CdkDropList<TableColumn[]>) {
    this.dropList = dropList;

    this.dropList.dropped
      .pipe(takeUntil(this.destroy$))
      .subscribe((event: CdkDragDrop<TableColumn[]>) => {

        /**
         * Guard:
         * Ensure drop container has valid data.
         * (Can be undefined during async binding edge cases)
         */
        if (!event.container?.data) return;

        this.handleDrop(event);
      });
  }

  /**
   * Handles drop event from CDK.
   *
   * Flow:
   * 1. Validate indices
   * 2. Extract current column snapshot
   * 3. Delegate reorder operation to table facade
   */
  private handleDrop(event: CdkDragDrop<TableColumn[]>): void {
    const { previousIndex, currentIndex, container } = event;

    // No-op if position didn't change
    if (previousIndex === currentIndex) return;

    const currentColumns: TableColumn[] = container.data;

    /**
     * Guard:
     * - Ensure data exists
     * - Ensure table directive is available
     */
    if (!currentColumns || !this.table) return;

    /**
     * Delegate reorder logic.
     *
     * Note:
     * Actual mutation + persistence handled inside facade.
     */
    this.table.reorderColumns(previousIndex, currentIndex);
  }

  /**
   * Cleanup all active subscriptions.
   */
  ngOnDestroy(): void {
    this.destroy$.next(undefined);
    this.destroy$.complete();
  }
}
