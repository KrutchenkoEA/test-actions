/* eslint-disable import/no-extraneous-dependencies */
import { Subscription } from 'rxjs';
import { IMnemoChartDataOptions, IMnemoChartLineData } from '../../../../models/charts';

export abstract class MnemoChartAbstractClass {
  public abstract chartData: IMnemoChartLineData[];
  public abstract isChartDataDownloading: boolean;

  public abstract subscriptions?: Subscription[];

  public abstract initSubscribe(): void;

  public abstract destroy(): void;

  public abstract setOptions(options: IMnemoChartDataOptions): void;

  public abstract getData(customTrend: IMnemoChartDataOptions[], defaultTrend?: IMnemoChartDataOptions): void;

  public abstract getSingleData(opt: IMnemoChartDataOptions): void;

  public abstract updateData(): void;

  public abstract clear(): void;

  public abstract nextTrigger(): void;

  public abstract errorTrigger(e: unknown): void;
}
