import { animate, AnimationEntryMetadata, state, style, transition, trigger } from '@angular/core';

// Component transition animations
export const fadeAnimation: AnimationEntryMetadata =
  trigger('routeAnimation', [
      state('*', 
            style({opacity: 1})),
      transition('void => *', [
            style({opacity: 0}),
            animate(500)
      ]),
      transition('* => void', 
            animate(500, 
            style({opacity: 0})))
    ]);