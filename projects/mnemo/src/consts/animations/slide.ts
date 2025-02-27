/* eslint-disable import/no-extraneous-dependencies */
import { state, transition, trigger, style, animate } from '@angular/animations';

export const slideContent = trigger('slideContent', [
  state('void', style({ transform: 'translateX(100%)', opacity: 0 })),
  state('enter', style({ transform: 'translateX(0%)', opacity: 1 })),
  transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
]);

export const slideInOutTop = trigger('slideInOutTop', [
  transition(':enter', [
    style({ opacity: 0, height: 0 }),
    animate('180ms ease-in-out', style({ opacity: 1, height: '*' })),
  ]),
  transition(':leave', [animate('180ms ease-in-out', style({ height: 0, opacity: 0 }))]),
]);
