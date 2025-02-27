/* eslint-disable import/no-extraneous-dependencies */
import { Component, ElementRef, inject } from '@angular/core';
import { POPUP_DIALOG_DATA } from '../../../../../services';

/**  @deprecated use MnemoChartModule */
@Component({
  selector: 'tl-mnemo-chart-print',
  template: '',
  styles: [':host { width:100%; height:100%; }'],
})
export class ChartPrintComponent {
  private readonly elementRef = inject(ElementRef);
  readonly data = inject<{ html: string }>(POPUP_DIALOG_DATA);

  constructor() {
    const data = this.data;

    this.elementRef.nativeElement.innerHTML = data.html;
  }
}
