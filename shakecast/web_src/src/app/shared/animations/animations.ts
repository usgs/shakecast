import { trigger,
         state,
         style,
         animate,
         transition } from '@angular/animations';
// Component transition animations
export const fadeAnimation =
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

export const navAnimation = 
      trigger('scrollChange', [
            state('up', 
                  style({top: '-60px'})),
            state('down', 
                  style({top: 0})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showLeft = 
      trigger('showLeft', [
            state('hidden', 
                  style({transform: 'translateX(0%)'})),
            state('shown', 
                  style({transform: 'translateX(100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showRight = 
      trigger('showRight', [
            state('hidden', 
                  style({transform: 'translateX(0%)'})),
            state('shown', 
                  style({transform: 'translateX(-100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);

export const showBottom = 
      trigger('showBottom', [
            state('hidden', 
                  style({transform: 'translateY(0%)'})),
            state('shown', 
                  style({transform: 'translateY(-100%)'})),
            transition('* => *', [
                  animate('250ms ease-in-out')
            ])
      ]);
