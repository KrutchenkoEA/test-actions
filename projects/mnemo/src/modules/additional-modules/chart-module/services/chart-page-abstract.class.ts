import { IVCDataOptions, IVCLineData } from '../../../../models';
import { ChartWrapService } from './chart-wrap.service';
import { ChartService } from './chart.service';

/**  @deprecated use MnemoChartModule */
export abstract class ChartPageAbstractClass {
  public abstract chartData: IVCLineData[];
  public abstract isChartDataDownloading: boolean;
  public abstract isGroupLineStyle: boolean;
  public abstract chartService: ChartService;
  public abstract chartWrapService: ChartWrapService;

  public abstract initSubscribe(isGroupLineStyle: boolean, isUpdateEnable: boolean): void;

  public abstract setOptions(options: IVCDataOptions): void;

  public abstract getData(customTrend: IVCDataOptions[], defaultTrend?: IVCDataOptions): void;

  public abstract getSingleData(opt: IVCDataOptions): void;

  public abstract updateData(): void;

  public abstract drawTagByPlayer(data: unknown[]): void;

  public abstract clear(): void;

  public abstract nextTrigger(): void;

  public abstract errorTrigger(e: unknown): void;
}
