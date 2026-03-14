import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';
/**
 * Reference to an active Matflow popover instance.
 * Provides APIs for interacting with the overlay.
 */
export class MatflowPopoverRef<T = unknown> {

  private readonly _afterClosed = new Subject<void>();

  constructor(private overlayRef: OverlayRef) {}

  /**
   * Emits when the popover has been closed.
   */
  afterClosed(): Observable<void> {
    return this._afterClosed.asObservable();
  }

  /**
   * Closes the popover.
   */
  close(): void {

    if (!this.overlayRef.hasAttached()) {
      return;
    }

    this.overlayRef.detach();

    this._afterClosed.next(undefined);
    this._afterClosed.complete();
  }

  /**
   * Returns whether the popover is currently open.
   */
  isOpen(): boolean {
    return this.overlayRef.hasAttached();
  }

}
