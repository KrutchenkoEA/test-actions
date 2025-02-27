/* eslint-disable import/no-extraneous-dependencies */
import { Component, ElementRef, inject } from '@angular/core';
import { POPUP_DIALOG_DATA } from '../../../../../services';

@Component({
  selector: 'tl-mnemo-chart-print-2',
  template: '',
  styles: [':host { width:100%; height:100%; }'],
})
export class MnemoChartPrintComponent {
  private readonly elementRef = inject(ElementRef);
  public readonly data = inject<{ html: string }>(POPUP_DIALOG_DATA);

  constructor() {
    this.elementRef.nativeElement.innerHTML = this.data.html;
  }
}
