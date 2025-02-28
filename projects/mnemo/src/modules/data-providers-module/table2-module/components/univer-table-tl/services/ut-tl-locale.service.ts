/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { LANGUAGE } from '@tl-platform/core';
import { LocaleType, Univer } from '@univerjs/core';
import { Observable, skip, Subject, takeUntil } from 'rxjs';

@Injectable()
export class UtTlLocaleService<
  U extends { univerTableDestroy$: Subject<void> },
  V extends {
    univer: Univer;
  },
> {
  private readonly language$ = inject<Observable<'ru' | 'en' | 'fa'>>(LANGUAGE);
  private readonly translocoService = inject(TranslocoService);

  private utdrService: V;

  public init(utService: U, utdrService: V): void {
    this.utdrService = utdrService;
    this.language$.pipe(skip(1), takeUntil(utService.univerTableDestroy$)).subscribe((l) => {
      this.setLocale(this.getActiveLocale(l));
    });
  }

  public getActiveLocale(l: 'ru' | 'en' | 'fa' = null): LocaleType {
    const lang: 'ru' | 'en' | 'fa' = l || (this.translocoService.getActiveLang() as 'ru' | 'en' | 'fa');
    switch (lang) {
      case 'ru':
        return LocaleType.RU_RU;
      case 'en':
        return LocaleType.EN_US;
      case 'fa':
        return LocaleType.FA_IR;
      default:
        return LocaleType.RU_RU;
    }
  }

  private setLocale(locale: LocaleType): void {
    this.utdrService?.univer?.setLocale(locale);
  }
}
