import { MatflowPopoverRef } from './matflow-popover-ref';

/**
 * Context passed to the popover template.
 *
 * `$implicit` exposes the user provided context while
 * `popover` provides access to the active popover instance.
 */
export interface MatflowPopoverContext<T> {

  /**
   * User supplied context value.
   */
  $implicit: T | undefined;

  /**
   * Reference to the active popover instance.
   */
  popover: MatflowPopoverRef<T>;

}
