import { Directive, TemplateRef } from '@angular/core';
import { MatflowPopoverContext } from './popover-context';

/**
 * Directive used to declare a popover template.
 *
 * The template receives a strongly typed context
 * defined by `MatflowPopoverContext`.
 */
@Directive({
  selector: 'ng-template[matflowPopover]',
  exportAs: 'matflowPopover',
  standalone: false
})
export class MatflowPopoverDirective<T> {

  constructor(
    public templateRef: TemplateRef<MatflowPopoverContext<T>>
  ) {}

  /**
   * Angular template type guard.
   */
  static ngTemplateContextGuard<T>(
    dir: MatflowPopoverDirective<T>,
    ctx: unknown
  ): ctx is MatflowPopoverContext<T> {
    return true;
  }

}
