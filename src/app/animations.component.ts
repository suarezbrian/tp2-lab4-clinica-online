import { trigger, transition, style, animate } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('300ms', style({ opacity: 0 }))
  ])
]);

export const salidaAnimation = trigger('slideInOutAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }), 
    animate('300ms ease-in', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    animate('300ms ease-in', style({ transform: 'translateX(100%)' })) 
  ])
]);