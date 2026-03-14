import {
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  ViewContainerRef
} from '@angular/core';

import {
  Overlay,
  OverlayRef,
  FlexibleConnectedPositionStrategy
} from '@angular/cdk/overlay';

import { TemplatePortal } from '@angular/cdk/portal';
import { Platform } from '@angular/cdk/platform';

import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';

import { fromEvent, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

import { MatflowPopoverDirective } from './matflow-popover.directive';
import { MatflowPopoverRef } from './matflow-popover-ref';
import { MatflowPopoverContext } from './popover-context';
import { DEFAULT_POPOVER_POSITIONS } from './popover-positions';

/**
 * Directive responsible for triggering a Matflow popover
 * connected to the host element using CDK Overlay.
 */
@Directive({
  selector: '[matflowPopoverTriggerFor]',
  exportAs: 'matflowPopoverTrigger',
  standalone: false
})
export class MatflowPopoverTriggerDirective<T> implements OnDestroy {

  /**
   * Popover template reference.
   */
  @Input('matflowPopoverTriggerFor')
  template?: MatflowPopoverDirective<T>;

  /**
   * Context passed to the template.
   */
  @Input()
  matflowPopoverContext?: T;

  /**
   * Overlay positions.
   */
  @Input()
  positions = DEFAULT_POPOVER_POSITIONS;

  private _useBackdrop = false;

  /**
   * Whether a backdrop should be rendered.
   */
  @Input()
  set useBackdrop(value: BooleanInput) {
    this._useBackdrop = coerceBooleanProperty(value);
  }

  get useBackdrop(): boolean {
    return this._useBackdrop;
  }

  private overlayRef?: OverlayRef;
  private popoverRef?: MatflowPopoverRef<T>;

  private subscriptions: { [key: string]: Subscription } = {};

  constructor(
    private el: ElementRef<HTMLElement>,
    private overlay: Overlay,
    private platform: Platform,
    private vcr: ViewContainerRef
  ) {}

  /**
   * Opens the popover.
   */
  display(): void {

    if (!this.platform.isBrowser || !this.template) {
      return;
    }

    if (!this.overlayRef) {
      this.createOverlay();
    }

    if (this.overlayRef!.hasAttached()) {
      return;
    }

    this.popoverRef = new MatflowPopoverRef<T>(this.overlayRef!);

    const portal = new TemplatePortal(
      this.template.templateRef,
      this.vcr,
      {
        $implicit: this.matflowPopoverContext,
        popover: this.popoverRef
      } as MatflowPopoverContext<T>
    );

    this.overlayRef!.attach(portal);
    this.overlayRef!.updatePosition();

    this.registerCloseHandlers();
  }

  /**
   * Creates the overlay instance.
   */
  private createOverlay(): void {

    const positionStrategy: FlexibleConnectedPositionStrategy =
      this.overlay
        .position()
        .flexibleConnectedTo(this.el.nativeElement)
        .withPositions(this.positions)
        .withFlexibleDimensions(false)
        .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: this.useBackdrop,
      backdropClass: 'cdk-overlay-transparent-backdrop'
    });
  }

  /**
   * Registers close event handlers.
   */
  private registerCloseHandlers(): void {

    if (!this.overlayRef) return;

    this.subscriptions.escapeKey =
      this.overlayRef.keydownEvents()
        .pipe(filter(e => e.key === 'Escape'))
        .subscribe(() => this.close());

    this.subscriptions.documentClick =
      fromEvent<MouseEvent>(document, 'click')
        .pipe(
          filter(event => {

            const target = event.target as HTMLElement;

            const clickedHost =
              this.el.nativeElement.contains(target);

            const clickedOverlay =
              this.overlayRef!.overlayElement.contains(target);

            return !clickedHost && !clickedOverlay;
          })
        )
        .subscribe(() => this.close());
  }

  /**
   * Closes the popover.
   */
  close(): void {

    Object.values(this.subscriptions)
      .filter(s => !s.closed)
      .forEach(s => s.unsubscribe());

    this.popoverRef?.close();
  }

  /**
   * Toggles popover state.
   */
  toggle(): void {
    this.popoverRef?.isOpen() ? this.close() : this.display();
  }

  ngOnDestroy(): void {

    this.close();

    this.overlayRef?.dispose();

    Object.values(this.subscriptions)
      .filter(s => !s.closed)
      .forEach(s => s.unsubscribe());
  }

}
