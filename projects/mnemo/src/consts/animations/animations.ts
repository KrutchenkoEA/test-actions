/* eslint-disable import/no-extraneous-dependencies */
import { animate, state, style, transition, trigger } from '@angular/animations';

export const popup = trigger('popup', [
  state('void', style({ transform: 'scale3d(0.75, 0.75, 0.75)', opacity: 0 })),
  state('enter', style({ transform: 'scale3d(1.0, 1.0, 1.0)', opacity: 1 })),
  transition('* => *', animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
]);
