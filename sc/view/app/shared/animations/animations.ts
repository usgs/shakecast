import { trigger,
         state,
         style,
         animate,
         transition,
         AnimationEntryMetadata } from '@angular/animations';
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

export const navAnimation: AnimationEntryMetadata = 
      trigger('scrollChange', [
            state('up', 
                  style({top: '-60px'})),
            state('down', 
                  style({top: 0})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showLeft: AnimationEntryMetadata = 
      trigger('showLeft', [
            state('hidden', 
                  style({transform: 'translateX(0%)'})),
            state('shown', 
                  style({transform: 'translateX(100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showRight: AnimationEntryMetadata = 
      trigger('showRight', [
            state('hidden', 
                  style({transform: 'translateX(0%)'})),
            state('shown', 
                  style({transform: 'translateX(-100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showBottom: AnimationEntryMetadata = 
      trigger('showBottom', [
            state('hidden', 
                  style({transform: 'translateY(0%)'})),
            state('shown', 
                  style({transform: 'translateY(-100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);
