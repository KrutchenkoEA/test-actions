/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IMnemoChartDataOptions, IMnemoChartDrawData } from '../../../../models';

@Injectable()
export class MnemoChartWrapService {
  public chartId: string = 'chart-page';

  public chartWrapClear$: Subject<null> = new Subject<null>();
  public chartWrapDestroy$: Subject<null> = new Subject<null>();
  public chartWrapLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public chartWrapTag$: BehaviorSubject<IMnemoChartDataOptions | null> =
    new BehaviorSubject<IMnemoChartDataOptions | null>(null);

  public chartWrapOmAttr$: BehaviorSubject<IMnemoChartDataOptions | null> =
    new BehaviorSubject<IMnemoChartDataOptions | null>(null);

  public chartWrapUserData$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  /** Прокидка объекта со значениями из chart-page-selector в chart-page */
  public chartWrapData$: BehaviorSubject<IMnemoChartDataOptions | null> =
    new BehaviorSubject<IMnemoChartDataOptions | null>(null);

  /** Прокидка объекта со значениями (готового к отрисовке) из chart-page в chart-wrapper */
  public chartDrawData$: BehaviorSubject<IMnemoChartDrawData | null> = new BehaviorSubject<IMnemoChartDrawData | null>(
    null
  );

  public chartSizeChanged$: BehaviorSubject<{ width: number; height: number }> = new BehaviorSubject<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

  public printEmit$: Subject<null> = new Subject<null>();

  public cleanChartData(): void {
    this.chartWrapLoading$.next(false);
    this.chartWrapClear$.next(null);
    this.chartWrapDestroy$.next(null);
    this.chartWrapDestroy$.complete();

    this.chartWrapData$.next(null);
    this.chartDrawData$.next(null);

    this.chartWrapTag$.next(null);
    this.chartWrapOmAttr$.next(null);
    this.chartWrapUserData$.next(null);
  }
}
