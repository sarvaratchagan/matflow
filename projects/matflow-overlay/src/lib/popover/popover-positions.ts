import { ConnectionPositionPair } from '@angular/cdk/overlay';

export const DEFAULT_POPOVER_POSITIONS = [
  new ConnectionPositionPair(
    { originX: 'end', originY: 'bottom' },
    { overlayX: 'end', overlayY: 'top' }
  ),
  new ConnectionPositionPair(
    { originX: 'start', originY: 'bottom' },
    { overlayX: 'start', overlayY: 'top' }
  ),
  new ConnectionPositionPair(
    { originX: 'start', originY: 'top' },
    { overlayX: 'start', overlayY: 'bottom' }
  ),
  new ConnectionPositionPair(
    { originX: 'end', originY: 'top' },
    { overlayX: 'end', overlayY: 'bottom' }
  ),
  new ConnectionPositionPair(
    { originX: 'end', originY: 'center' },
    { overlayX: 'end', overlayY: 'center' }
  ),
  new ConnectionPositionPair(
    { originX: 'start', originY: 'center' },
    { overlayX: 'end', overlayY: 'center' }
  ),
  new ConnectionPositionPair(
    { originX: 'end', originY: 'center' },
    { overlayX: 'start', overlayY: 'center' }
  ),
  new ConnectionPositionPair(
    { originX: 'center', originY: 'center' },
    { overlayX: 'center', overlayY: 'center' }
  )
];
