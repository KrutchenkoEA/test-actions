/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { TluiChartLineDataSimple } from '@tl-platform/ui';
import { BehaviorSubject, Subscription } from 'rxjs';
import { IFormulaObjectChart, IMnemoChartDataOptions, IMnemoChartLineData } from '../../../../models';
import { MnemoLoggerService } from '../../../../services';
import { MnemoChartAbstractClass } from './mnemo-chart-abstract.class';
import { MnemoChartWrapService } from './mnemo-chart-wrap.service';

@Injectable()
export class MnemoChartFormulaService implements MnemoChartAbstractClass {
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public mnemoChartWrapService = inject(MnemoChartWrapService);

  public subscriptions: Subscription[] = [];

  public dataMap = new Map<string, TluiChartLineDataSimple[]>();

  public chartData: IMnemoChartLineData[] = [];
  public chartData$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);

  public selectedItems: IFormulaObjectChart[] = [];
  public isChartDataDownloading: boolean = false;
  public updateEnabled: boolean = true;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public initSubscribe(): void {
  }

  public destroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public setOptions(options: IMnemoChartDataOptions): void {
    this.getData(null, null);
  }

  public getData(
    customTrend: IMnemoChartDataOptions[],
    defaultTrend?: IMnemoChartDataOptions,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isExistData: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    isUpdate: boolean = false,
  ): void {
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getSingleData(opt: IMnemoChartDataOptions): void {
  }

  public updateData(): void {
    this.getData(null, null, true, true);
  }

  public clear(): void {
    this.chartData = [];
    this.selectedItems = [];
    this.dataMap.clear();
    this.mnemoChartWrapService.chartWrapLoading$.next(false);
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
    this.mnemoChartWrapService.chartWrapLoading$.next(false);
  }
}
