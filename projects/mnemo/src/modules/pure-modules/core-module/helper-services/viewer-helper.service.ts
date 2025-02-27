/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { ProviderScope, TRANSLOCO_SCOPE, TranslocoScope, TranslocoService } from '@jsverse/transloco';
import { StatusType } from '../../../../models';

@DecorateUntilDestroy()
@Injectable()
export class ViewerHelperService {
  private readonly scope = inject<TranslocoScope>(TRANSLOCO_SCOPE);
  private readonly translocoService = inject(TranslocoService);

  public getStatus(status: number): StatusType {
    if (!status) {
      return '';
    }
    const statusBin = status.toString(2);
    let bin12Charts = '';

    if (statusBin.length > 12) {
      bin12Charts = statusBin.slice(statusBin.length - 12);
    } else if (statusBin.length < 12) {
      bin12Charts =
        Array(12 - statusBin.length)
          .fill('0')
          .join('') + statusBin;
    } else {
      bin12Charts = statusBin;
    }

    const qq = bin12Charts.charAt(4) + bin12Charts.charAt(5);

    if (qq === '00') {
      return 'Bad';
    }
    if (qq === '01' || qq === '10') {
      return 'Uncertain';
    }
    if (qq === '11') {
      return 'Good';
    }
    return '';
  }

  public getTranslate(word: string): string {
    let newWord: string = '';
    this.translocoService
      .selectTranslate(
        `ViewerHelperService.${word}`,
        {},
        (this.scope as unknown as TranslocoScope[]).find((scope) => (scope as ProviderScope).scope === 'mnemo')
      )
      .pipe(takeUntilDestroyed(this))
      .subscribe((message: string) => {
        newWord = message;
      });
    return newWord;
  }

  public displayFormatter(format: string, value: number): string {
    if (!format) {
      return value.toString();
    }
    const [integerFormat = '', fractionalFormat = ''] = format.split('.') as [string, string];
    const [integer = '', fractional = ''] = value.toString().split('.');

    let intFixed = false;
    let intSeparator = '';
    const intLen = integerFormat.split(',').join('').length;
    if (integerFormat.includes('0')) {
      intFixed = true;
    }
    if (integerFormat.includes(',')) {
      intSeparator = ',';
    }
    if (integerFormat.includes(' ')) {
      intSeparator = ' ';
    }

    let frfixed = false;
    const frLen = fractionalFormat.split(',').join('').length;
    if (fractionalFormat.includes('0')) {
      frfixed = true;
    }

    let resInt = integer;
    if (integer.length >= intLen) {
      resInt = integer;
    } else if (intFixed) {
      resInt = new Array(intLen - integer.length).fill(0).join('') + integer;
    } else {
      resInt = integer;
    }
    if (intLen === 0) {
      resInt = '';
    }
    resInt = resInt.replace(/\B(?=(\d{3})+(?!\d))/g, intSeparator);

    let resFr = fractional;
    if (fractional.length >= frLen) {
      resFr = Number(`0.${fractional}`).toFixed(frLen).replace(/^0./, '');
    } else if (frfixed) {
      resFr = fractional + new Array(frLen - fractional.length).fill(0).join('');
    } else {
      resFr = Number(`0.${fractional}`).toFixed(fractional.length).replace(/^0./, '');
    }
    if (frLen === 0) {
      resFr = '';
    }
    return resInt + (frLen === 0 ? '' : `.${resFr}`);
  }

  public getActiveLang(): string {
    return this.translocoService.getActiveLang();
  }
}
