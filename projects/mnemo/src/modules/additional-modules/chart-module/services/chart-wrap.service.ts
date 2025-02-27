/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IVCDataOptions, IViewerChartModels } from '../../../../models';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartWrapService {
  public chartId: string = 'chart-page';

  /** Динамический массив с именами слоев */
  public layerNames: string[] = [];

  public chartWrapClear$: Subject<null> = new Subject<null>();
  public chartWrapDestroy$: Subject<null> = new Subject<null>();
  public chartWrapLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public chartWrapTag$: BehaviorSubject<IVCDataOptions | null> = new BehaviorSubject<IVCDataOptions | null>(null);
  public chartWrapOmAttr$: BehaviorSubject<IVCDataOptions | null> = new BehaviorSubject<IVCDataOptions | null>(null);
  public chartWrapUserData$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  /** Прокидка объекта со значениями из chart-page-selector в chart-page */
  public chartPageData$: BehaviorSubject<IVCDataOptions | null> = new BehaviorSubject<IVCDataOptions | null>(null);
  /** Прокидка объекта со значениями (готового к отрисовке) из chart-page в chart-wrapper */
  public chartPageDrawData$: BehaviorSubject<IViewerChartModels | null> =
    new BehaviorSubject<IViewerChartModels | null>(null);

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

    this.chartPageData$.next(null);
    this.chartPageDrawData$.next(null);

    this.chartWrapTag$.next(null);
    this.chartWrapOmAttr$.next(null);
    this.chartWrapUserData$.next(null);

    this.layerNames = [];
  }
}
