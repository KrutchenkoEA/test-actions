/* eslint-disable import/no-extraneous-dependencies */
import { ConnectedPosition } from '@angular/cdk/overlay';
import { ElementRef } from '@angular/core';

export interface IPopupConfiguration {
  origin?: ElementRef<HTMLElement>;
  width?: number;
  height?: number;
  positions?: ConnectedPosition[];
  hasBackdrop?: boolean;
  panelClass?: string;
}
