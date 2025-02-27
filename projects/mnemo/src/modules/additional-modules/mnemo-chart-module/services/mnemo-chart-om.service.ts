/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, forkJoin, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import {
  IMnemoChartDataOptions,
  IMnemoChartLineData,
  IOMAttribute,
  IOMAttributeData,
  IOmObjectChart,
} from '../../../../models';
import { MnemoLoggerService, RtdbOmApiService } from '../../../../services';
import { PlayerModeService, PlayerService, ViewerIntervalService, ViewerMapperService } from '../../../pure-modules';
import { MnemoChartAbstractClass } from './mnemo-chart-abstract.class';
import { MnemoChartColorService } from './mnemo-chart-color.service';
import { MnemoChartWrapService } from './mnemo-chart-wrap.service';
import { MnemoChartService } from './mnemo-chart.service';
import { TluiChartLineDataSimple } from '@tl-platform/ui';

@Injectable()
export class MnemoChartOmService implements MnemoChartAbstractClass {
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly playerService = inject(PlayerService);
  private readonly mnemoChartColorService = inject(MnemoChartColorService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public mnemoChartService = inject(MnemoChartService);
  public mnemoChartWrapService = inject(MnemoChartWrapService);

  public subscriptions: Subscription[] = [];

  public dataMap = new Map<string, TluiChartLineDataSimple[]>();

  public chartData: IMnemoChartLineData[] = [];
  public chartData$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);

  public selectedItems: IOmObjectChart[] = [];
  public isChartDataDownloading: boolean = false;
  public updateEnabled: boolean = true;

  public initSubscribe(): void {
    const dataSub$ = this.mnemoChartWrapService.chartWrapData$
      .pipe(debounceTime(500))
      .subscribe((opt: IMnemoChartDataOptions) => {
        if (!opt?.omAttributes?.length) {
          return;
        }
        if (this.playerModeService.isPlayerMode) {
          this.setOptionsByPlayer(opt);
        } else {
          this.setOptions(opt);
        }
      });

    const attrDataSub$ = this.mnemoChartWrapService.chartWrapOmAttr$.subscribe((opt) => {
      if (!opt?.omAttributes) {
        return;
      }
      if (this.playerModeService.isPlayerMode) {
        this.getSingleDataByPlayer(opt);
      } else {
        this.getSingleData(opt);
      }
    });

    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(filter(() => !this.isChartDataDownloading && this.updateEnabled && !this.playerModeService.isPlayerMode))
      .subscribe(() => {
        if (!this.selectedItems.length) {
          return;
        }
        this.updateData();
      });

    const playerModeSub$ = this.playerModeService.isPlayerMode$.pipe(filter(() => this.updateEnabled)).subscribe(() => {
      this.isChartDataDownloading = true;
      this.chartData = [];
      this.dataMap.clear();
      this.nextTrigger();
    });

    const playerSub$ = this.playerService.dateObjChanged$
      .pipe(filter(() => this.playerModeService.isPlayerMode))
      .subscribe((d) => {
        this.setOptions({
          ...this.mnemoChartWrapService.chartWrapData$.value,
          date: {
            start: d.periodFrom,
            end: d.periodTo,
          },
        });
      });

    this.subscriptions.push(dataSub$, attrDataSub$, intervalSub$, playerModeSub$, playerSub$);
  }

  public destroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public setOptionsByPlayer(options: IMnemoChartDataOptions): void {
    const date = this.playerService.dateObjChanged$.value;

    this.setOptions({
      ...options,
      date: {
        start: date.periodFrom,
        end: date.periodTo,
      },
    });
  }

  public setOptions(options: IMnemoChartDataOptions): void {
    this.selectedItems = options.omAttributes;
    this.mnemoChartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;
    this.dataMap.clear();

    const customTrend: IMnemoChartDataOptions[] = [];

    options.omAttributes?.forEach((attr) => {
      const trendReqSetting = this.mnemoChartService.getRequestOptions(
        this.mnemoChartWrapService.chartId,
        attr.attrGuid
      );
      const opt: IMnemoChartDataOptions = {
        omAttributes: [attr],
        date: trendReqSetting?.date
          ? {
              start: trendReqSetting?.date?.start,
              end: trendReqSetting?.date?.end,
            }
          : {
              start: options.date?.start,
              end: options.date?.end,
            },
        fixedPoints: trendReqSetting?.fixedPoints !== false,
        points: trendReqSetting?.points ?? null,
      };
      customTrend.push(opt);
    });
    this.getData(customTrend);
  }

  public getData(
    customTrend: IMnemoChartDataOptions[],
    defaultTrend?: IMnemoChartDataOptions,
    isExistData: boolean = false,
    isUpdate: boolean = false
  ): void {
    forkJoin(
      customTrend?.map((attr) => {
        return this.rtdbOmApiService.getOMAttributes(
          attr.omAttributes[0].attrParentGuid,
          [attr.omAttributes[0].attrGuid],
          attr.date?.start?.toISOString(),
          attr.date?.end?.toISOString()
        );
      })
    )
      .pipe(
        map((attrs: IOMAttribute[], index: number) => {
          return attrs.map((attr) => [
            attr.data[0],
            this.sortData(
              attrs[0],
              this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, attrs[0].data[0].attributeId)
                ?.exponent,
              isExistData,
              customTrend[index]?.fixedPoints,
              customTrend[index]?.points
            ),
          ]);
        }),
        map((attrs: [IOMAttributeData, boolean][]) => {
          if (attrs?.length) {
            attrs.forEach((attr) => {
              this.mapDataForChart(attr[0]);
            });
          }
          return attrs;
        }),
        map((attrs: [IOMAttributeData, boolean][]) => {
          if (attrs.length !== this.selectedItems?.length) {
            this.selectedItems?.forEach((t) => {
              const emptyAttr = attrs?.find((attr) => attr[0]?.attributeId === t.attrGuid);
              if (!emptyAttr) {
                this.dataMap.set(t.attrGuid, []);
                this.mapDataForChart({ attributeId: t.attrGuid, name: t.attrName });
              }
            });
          }

          return attrs;
        }),
        takeUntil(this.mnemoChartWrapService.chartWrapDestroy$)
      )
      .subscribe({
        next: () => this.nextTrigger(isUpdate),
        error: (e) => this.errorTrigger(e),
      });
  }

  public getSingleData(options: IMnemoChartDataOptions): void {
    if (!this.selectedItems.find((item) => item.attrGuid === options.omAttributes[0].attrGuid)) {
      this.selectedItems.push(options.omAttributes[0]);
    }

    this.mnemoChartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;

    this.rtdbOmApiService
      .getOMAttributes(
        options.omAttributes[0].attrParentGuid,
        [options.omAttributes[0].attrGuid],
        options.date?.start?.toISOString(),
        options.date?.end?.toISOString()
      )
      .pipe(
        map((attr) => {
          return [
            attr.data[0],
            this.sortData(
              attr[0],
              this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, attr.data[0].attributeId)
                ?.exponent,
              false,
              options?.fixedPoints,
              options?.points
            ),
          ];
        }),
        map((attr: [IOMAttributeData, boolean]) => {
          if (attr?.length) {
            this.mapDataForChart(attr[0]);
          }
          return [attr];
        }),
        takeUntil(this.mnemoChartWrapService.chartWrapDestroy$)
      )
      .subscribe({
        next: () => this.nextTrigger(),
        error: (e) => this.errorTrigger(e),
      });
  }

  public getSingleDataByPlayer(options: IMnemoChartDataOptions): void {
    const date = this.playerService.dateObjChanged$.value;

    this.getSingleData({
      ...options,
      date: {
        start: date.periodFrom,
        end: date.periodTo,
      },
    });
  }

  public updateData(): void {
    const customTrend: IMnemoChartDataOptions[] = this.selectedItems.map((attr) => {
      const attrData = this.dataMap.get(attr.attrGuid);
      // eslint-disable-next-line no-unsafe-optional-chaining
      const lastDate = attrData?.[attrData?.length - 1]?.[0] as Date;
      return {
        omAttributes: [attr],
        date: {
          start: lastDate || new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
          end: new Date(),
        },
      };
    });

    this.getData(customTrend, null, true, true);
  }

  public sortData(
    attr: IOMAttribute,
    exponent: number = 1,
    isExistData: boolean = false,
    fixedPoints: boolean = true,
    points: number | null = null
  ): boolean {
    let existData: TluiChartLineDataSimple[] = [];

    if (isExistData) {
      existData = this.dataMap.get(attr.data[0]?.attributeId) ?? [];
    }
    const value: TluiChartLineDataSimple[] = [];
    const data = attr?.data[0]?.values;
    if (!data?.length) {
      return false;
    }

    const requiredLength = points ?? existData?.length ?? data?.length;
    if (
      data?.length === 1 &&
      existData?.length &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      new Date(data[0]?.timeStamp).getTime() === new Date(existData?.[existData?.length - 1][0]).getTime()
    ) {
      return true;
    }

    data.reverse();
    data.forEach((d) => value.push(this.viewerMapperService.prepareOmAttrDataMapRest(d, exponent)));
    const resultData = fixedPoints ? [...existData, ...value].slice(-requiredLength) : [...existData, ...value];
    this.dataMap.set(attr.data[0]?.attributeId, resultData.reverse());
    return true;
  }

  public mapDataForChart(attr: { name: string; attributeId: string }): void {
    const attrData = this.dataMap.get(attr.attributeId);
    if (!attrData) {
      return;
    }

    let index = -1;
    if (this.chartData.find((d) => d.name === attr.name)) {
      index = this.chartData.findIndex((d) => d.name === attr.name);
    }
    if (index === -1) {
      this.chartData.push({
        name: attr.name,
        id: attr.attributeId,
        data: attrData,
        color: this.mnemoChartColorService.getColor(
          this.selectedItems.findIndex((d) => d.attrName === attr.name),
          2
        ),
      });
    } else {
      this.chartData[index].data = attrData;
    }
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
