/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { TluiLCLineInputData } from '@tl-platform/ui';
import { BehaviorSubject } from 'rxjs';
import { IFormulaObjectChart, IVCDataOptions, IVCLineData } from '../../../../models';
import { MnemoLoggerService } from '../../../../services';
import { ChartPageAbstractClass } from './chart-page-abstract.class';
import { ChartWrapService } from './chart-wrap.service';
import { ChartService } from './chart.service';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartPageFormulaService implements ChartPageAbstractClass {
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);

  public dataMap = new Map<string, TluiLCLineInputData[]>();

  public chartData: IVCLineData[] = [];
  public chartData$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);

  public selectedItems: IFormulaObjectChart[] = [];
  public isChartDataDownloading: boolean = false;
  public isGroupLineStyle: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public initSubscribe(isGroupLineStyle: boolean, isUpdateEnable: boolean = true): void {
    this.isGroupLineStyle = isGroupLineStyle;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setOptions(options: IVCDataOptions): void {
    this.getData(null, null);
  }

  public getData(
    customTrend: IVCDataOptions[],
    defaultTrend?: IVCDataOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isExistData: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isUpdate: boolean = false
  ): void {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getSingleData(opt: IVCDataOptions): void {}

  public updateData(): void {
    this.getData(null, null, true, true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public drawTagByPlayer(data: unknown[]): void {
    this.nextTrigger(true);
  }

  public clear(): void {
    this.chartData = [];
    this.selectedItems = [];
    this.dataMap.clear();
    this.chartWrapService.chartWrapLoading$.next(false);
    this.chartData$.next([]);
  }

  public nextTrigger(isUpdate: boolean = false): void {
    this.isChartDataDownloading = false;
    if (isUpdate) {
      this.chartDataUpdate$.next(this.chartData);
    } else {
      this.chartData$.next(this.chartData);
    }
  }

  public errorTrigger(e: unknown): void {
    this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    this.isChartDataDownloading = false;
    this.chartWrapService.chartWrapLoading$.next(false);
  }
}
