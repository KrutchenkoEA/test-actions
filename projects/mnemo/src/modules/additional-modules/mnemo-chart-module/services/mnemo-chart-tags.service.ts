/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, forkJoin, Observable, of, Subscription } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { IMnemoChartDataOptions, IMnemoChartLineData, ITagHistoryData, ITagObjectChart } from '../../../../models';
import { MnemoLoggerService, RtdbTagApiService } from '../../../../services';
import { PlayerModeService, PlayerService, ViewerIntervalService, ViewerMapperService } from '../../../pure-modules';
import { MnemoChartAbstractClass } from './mnemo-chart-abstract.class';
import { MnemoChartColorService } from './mnemo-chart-color.service';
import { MnemoChartWrapService } from './mnemo-chart-wrap.service';
import { MnemoChartService } from './mnemo-chart.service';
import { TluiChartLineDataSimple } from '@tl-platform/ui';

@Injectable()
export class MnemoChartTagsService implements MnemoChartAbstractClass {
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly playerService = inject(PlayerService);
  private readonly mnemoChartColorService = inject(MnemoChartColorService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public mnemoChartService = inject(MnemoChartService);
  public mnemoChartWrapService = inject(MnemoChartWrapService);

  public subscriptions: Subscription[] = [];

  public dataMap: Map<string, TluiChartLineDataSimple[]> = new Map<string, TluiChartLineDataSimple[]>();

  public chartData: IMnemoChartLineData[] = [];
  public chartData$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IMnemoChartLineData[]> = new BehaviorSubject<IMnemoChartLineData[]>([]);

  public selectedItems: ITagObjectChart[] = [];
  public isChartDataDownloading: boolean = false;
  public updateEnabled: boolean = true;

  public initSubscribe(): void {
    const dataSub$ = this.mnemoChartWrapService.chartWrapData$
      .pipe(debounceTime(500))
      .subscribe((opt: IMnemoChartDataOptions) => {
        if (!opt?.tags?.length) {
          return;
        }
        if (this.playerModeService.isPlayerMode) {
          this.setOptionsByPlayer(opt);
        } else {
          this.setOptions(opt);
        }
      });

    const tagDataSub$ = this.mnemoChartWrapService.chartWrapTag$.subscribe((opt: IMnemoChartDataOptions) => {
      if (!opt?.tags?.length) {
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

    const playerModeSub$ = this.playerModeService.isPlayerMode$.subscribe(() => {
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

    this.subscriptions.push(dataSub$, tagDataSub$, intervalSub$, playerModeSub$, playerSub$);
  }

  public destroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public setOptions(options: IMnemoChartDataOptions): void {
    this.selectedItems = options.tags;
    this.mnemoChartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;
    this.dataMap.clear();
    const defaultTrendsName: string[] = [];
    const customTrend: IMnemoChartDataOptions[] = [];
    options.tags?.forEach((tag) => {
      const trendReqSetting = this.mnemoChartService.getRequestOptions(this.mnemoChartWrapService.chartId, tag.tagName);
      if (trendReqSetting) {
        const opt: IMnemoChartDataOptions = {
          tagNamesString: [tag.tagName],
          date: {
            start: trendReqSetting?.date?.start,
            end: trendReqSetting?.date?.end,
          },
          fixedPoints: trendReqSetting?.fixedPoints !== false,
          points: trendReqSetting?.points ?? null,
          scale: trendReqSetting?.scale !== false,
          intervalsCount: trendReqSetting?.intervalsCount,
        };
        customTrend.push(opt);
      } else {
        defaultTrendsName.push(tag.tagName);
      }
    });

    const defaultTrend: IMnemoChartDataOptions = {
      tagNamesString: defaultTrendsName,
      date: {
        start: options.date?.start,
        end: options.date?.end,
      },
      fixedPoints: options?.fixedPoints !== false,
      points: options.points ?? null,
      scale: options?.scale !== false,
      intervalsCount: options?.intervalsCount,
    };
    this.getData(customTrend, defaultTrend);
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

  public getData(customTrend: IMnemoChartDataOptions[], defaultTrend: IMnemoChartDataOptions): void {
    let sub: Observable<unknown>;
    const defaultSub = this.rtdbTagApiService.getTagHistoryByArray(
      defaultTrend.tagNamesString,
      null,
      '0',
      defaultTrend.date?.start?.toISOString(),
      defaultTrend.date?.end?.toISOString(),
      null,
      defaultTrend?.scale,
      defaultTrend?.intervalsCount,
    );
    if (customTrend?.length) {
      sub = forkJoin(
        defaultSub,
        forkJoin(
          customTrend?.map((opt) => {
            return this.rtdbTagApiService.getTagHistoryByArray(
              opt.tagNamesString,
              null,
              '0',
              opt.date?.start?.toISOString(),
              opt.date?.end?.toISOString(),
              null,
              opt?.scale,
              opt?.intervalsCount,
            );
          }),
        ),
      );
    } else {
      sub = forkJoin(defaultSub, forkJoin(of([])));
    }

    this.chartData = [];

    sub
      .pipe(
        map((arrs: [ITagHistoryData[], ITagHistoryData[][]]) => {
          const ar1 = arrs[0]?.map((tag: ITagHistoryData) => {
            return [
              tag.name,
              this.sortData(
                tag,
                this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, tag.name)?.exponent,
                false,
                defaultTrend?.fixedPoints,
                defaultTrend?.points,
              ),
            ];
          });

          const ar2 = arrs[1]?.map((tags: ITagHistoryData[], index: number) => {
            return tags?.map((tag: ITagHistoryData) => {
              return [
                tag.name,
                this.sortData(
                  tag,
                  this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, tag.name)?.exponent,
                  false,
                  customTrend[index]?.fixedPoints,
                  customTrend[index]?.points,
                ),
              ];
            });
          });

          return [...ar1, ...ar2.flat(1)];
        }),
        map((tags: [string, boolean][]) => {
          if (tags?.length) {
            tags.forEach((tag) => {
              this.mapDataForChart(tag[0]);
            });
          }
          return tags;
        }),
        map((tags: [string, boolean][]) => {
          if (tags.length !== this.selectedItems?.length) {
            this.selectedItems?.forEach((selectedTag) => {
              const emptyTag = tags?.find((tag) => tag[0] === selectedTag.tagName);
              if (!emptyTag) {
                this.dataMap.set(selectedTag.tagName, []);
                this.mapDataForChart(selectedTag.tagName);
              }
            });
          }
          return tags;
        }),
        takeUntil(this.mnemoChartWrapService.chartWrapDestroy$),
      )
      .subscribe({
        next: () => this.nextTrigger(),
        error: (e: unknown) => this.errorTrigger(e),
      });
  }

  public getSingleData(options: IMnemoChartDataOptions): void {
    if (!this.selectedItems.find((tag) => tag.tagName === options.tags[0].tagName)) {
      this.selectedItems.push(options.tags[0]);
    }
    this.mnemoChartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;

    this.rtdbTagApiService
      .getTagHistoryByArray(
        [options.tags[0].tagName],
        null,
        '0',
        options.date?.start?.toISOString(),
        options.date?.end?.toISOString(),
        null,
        options?.scale,
        options?.intervalsCount,
      )
      .pipe(
        map((tag: ITagHistoryData[]) => [
          tag[0].name,
          this.sortData(
            tag[0],
            this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, tag[0].name)?.exponent,
            false,
            options?.fixedPoints,
            options?.points,
          ),
        ]),
        map((tag: [string, boolean]) => {
          if (tag) {
            this.mapDataForChart(tag[0]);
          }
          return [tag];
        }),
        takeUntil(this.mnemoChartWrapService.chartWrapDestroy$),
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
    forkJoin(
      this.selectedItems.map((tag) => {
        const tagData = this.dataMap.get(tag.tagName);
        const lastDate = tagData?.[tagData.length - 1]?.[0] as Date;
        const opt: IMnemoChartDataOptions = {
          points: 0,
          date: {
            start: lastDate || new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
            end: new Date(),
          },
        };
        return this.rtdbTagApiService.getTagHistoryByArray(
          [tag.tagName],
          null,
          '0',
          opt.date?.start?.toISOString(),
          opt.date?.end?.toISOString(),
          null,
        );
      }),
    )
      .pipe(
        map((arrs: ITagHistoryData[][]) => {
          return arrs?.flat(2)?.map((tag: ITagHistoryData) => {
            const trendReqSettings = this.mnemoChartService.getRequestOptions(
              this.mnemoChartWrapService.chartId,
              tag.name,
            );
            return [
              tag.name,
              this.sortData(
                tag,
                this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, tag.name)?.exponent,
                true,
                trendReqSettings?.fixedPoints,
                trendReqSettings?.points,
              ),
            ];
          });
        }),
        map((tags: [string, boolean][]) => {
          if (tags?.length) {
            tags.forEach((tag) => {
              this.mapDataForChart(tag[0]);
            });
          }
          return tags;
        }),
        map((tags: [string, boolean][]) => {
          if (tags.length !== this.selectedItems?.length) {
            this.selectedItems.forEach((t) => {
              const tag = tags?.find((it) => it[0] === t.tagName);
              if (!tag) {
                this.dataMap.set(t.tagName, []);
                this.mapDataForChart(t.tagName);
              }
            });
          }
          return tags;
        }),
        takeUntil(this.mnemoChartWrapService.chartWrapDestroy$),
      )
      .subscribe({
        next: () => this.nextTrigger(true),
        error: (e) => this.errorTrigger(e),
      });
  }

  public sortData(
    tag: ITagHistoryData,
    exponent: number = 1,
    isExistData: boolean = false,
    fixedPoints: boolean = true,
    points: number | null = null,
  ): boolean {
    let existData: TluiChartLineDataSimple[] = [];

    if (isExistData) {
      existData = this.dataMap.get(tag.name) ?? [];
    }

    const value: TluiChartLineDataSimple[] = [];
    const data = tag.points;
    if (!data?.length) {
      return false;
    }

    const requiredLength = points ?? existData?.length ?? data?.length;
    if (
      data?.length === 1 &&
      existData?.length &&
      // eslint-disable-next-line no-unsafe-optional-chaining
      new Date(data[0]?.time).getTime() === new Date(existData?.[existData?.length - 1][0]).getTime()
    ) {
      return true;
    }

    data.reverse();
    data.forEach((d) => value.push(this.viewerMapperService.prepareTagDataMapRest(d, exponent)));
    const resultData = fixedPoints ? [...existData, ...value].slice(-requiredLength) : [...existData, ...value];
    this.dataMap.set(tag.name, resultData);
    return true;
  }

  public mapDataForChart(tagName: string): void {
    const tagData = this.dataMap.get(tagName);
    if (!tagData) {
      return;
    }

    let index = -1;
    if (this.chartData.find((t) => t.name === tagName)) {
      index = this.chartData.findIndex((t) => t.name === tagName);
    }
    if (index === -1) {
      this.chartData.push({
        name: tagName,
        id: tagName,
        data: tagData,
        color: this.mnemoChartColorService.getColor(
          this.selectedItems.findIndex((t) => t.tagName === tagName),
          1,
        ),
      });
    } else {
      this.chartData[index].data = tagData;
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

  public errorTrigger(e): void {
    this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    this.isChartDataDownloading = false;
    this.mnemoChartWrapService.chartWrapLoading$.next(false);
  }
}
