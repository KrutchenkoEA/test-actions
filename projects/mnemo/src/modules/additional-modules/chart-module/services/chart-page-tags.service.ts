/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, forkJoin, Observable, of, throttleTime } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';
import { ITagHistoryData, ITagObjectChart, ITagsValues, IVCDataOptions, IVCLineData } from '../../../../models';
import { MnemoLoggerService, RtdbTagApiService } from '../../../../services';
import { PlayerModeService, ViewerMapperService, ViewerTagService } from '../../../pure-modules';
import { ChartColorService } from './chart-color.service';
import { ChartPageAbstractClass } from './chart-page-abstract.class';
import { ChartWrapService } from './chart-wrap.service';
import { ChartService } from './chart.service';
import { TluiLCLineInputData } from '@tl-platform/ui';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartPageTagsService implements ChartPageAbstractClass {
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);

  public dataMap: Map<string, TluiLCLineInputData[]> = new Map<string, TluiLCLineInputData[]>();

  public chartData: IVCLineData[] = [];
  public chartData$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);

  public selectedItems: ITagObjectChart[] = [];
  public isChartDataDownloading: boolean = false;

  public isGroupLineStyle: boolean = false;

  public initSubscribe(isGroupLineStyle: boolean, isUpdateEnable: boolean = true): void {
    this.isGroupLineStyle = isGroupLineStyle;
    this.chartWrapService.chartPageData$
      .pipe(debounceTime(500), takeUntil(this.chartWrapService.chartWrapDestroy$))
      .subscribe((opt) => {
        if (!(opt && opt?.tags?.length)) {
          return;
        }
        this.setOptions(opt);
      });

    this.chartWrapService.chartWrapTag$.pipe(takeUntil(this.chartWrapService.chartWrapDestroy$)).subscribe((opt) => {
      if (!(opt && opt?.tag)) {
        return;
      }
      this.getSingleData(opt);
    });

    if (isUpdateEnable) {
      this.playerModeService.isPlayerMode$.pipe(takeUntil(this.chartWrapService.chartWrapDestroy$)).subscribe(() => {
        this.isChartDataDownloading = true;
        this.chartData = [];
        this.dataMap.clear();
        this.nextTrigger();
      });

      this.viewerTagService.updateTagData$
        .pipe(
          filter(() => !this.isChartDataDownloading),
          takeUntil(this.chartWrapService.chartWrapDestroy$),
        )
        .subscribe(() => {
          if (!this.selectedItems.length) {
            return;
          }
          this.updateData();
        });

      this.viewerTagService.updateTagDataPlayer$
        .pipe(throttleTime(1000), takeUntil(this.chartWrapService.chartWrapDestroy$))
        .subscribe((tags) => {
          if (!this.selectedItems.length) {
            return;
          }
          this.drawTagByPlayer(tags);
        });
    }
  }

  public setOptions(options: IVCDataOptions): void {
    this.selectedItems = options.tags;
    this.chartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;
    this.dataMap.clear();

    const customTrend: IVCDataOptions[] = [];
    const defaultTrendsName: string[] = [];

    options.tags.forEach((tag) => {
      const customOpt = this.chartService.getLineOptions(
        this.chartWrapService.chartId,
        tag.tagName,
        this.isGroupLineStyle,
      )?.req;
      if (customOpt) {
        const opt: IVCDataOptions = {
          tag,
          pointsCount: customOpt?.pointsCount ?? null,
          date: {
            start: customOpt?.date?.start,
            end: customOpt?.date?.end,
          },
          isExistData: false,
        };
        customTrend.push(opt);
      } else {
        defaultTrendsName.push(tag.tagName);
      }
    });

    const defaultTrend: IVCDataOptions = {
      tagNamesString: defaultTrendsName,
      pointsCount: options.pointsCount ?? null,
      date: {
        start: options.date?.start,
        end: options.date?.end,
      },
    };

    this.getData(customTrend, defaultTrend);
  }

  public getData(customTrend: IVCDataOptions[], defaultTrend: IVCDataOptions): void {
    let sub: Observable<unknown>;
    const defaultSub = this.rtdbTagApiService.getTagHistoryByArray(
      defaultTrend.tagNamesString,
      null,
      defaultTrend.pointsCount?.toString() ?? null,
      defaultTrend.date?.start?.toISOString(),
      defaultTrend.date?.end?.toISOString(),
    );
    if (customTrend?.length) {
      sub = forkJoin(
        defaultSub,
        forkJoin(
          customTrend?.map((opt) => {
            return this.rtdbTagApiService.getTagHistoryByArray(
              [opt.tag.tagName],
              null,
              opt.pointsCount?.toString() ?? null,
              opt.date?.start?.toISOString(),
              opt.date?.end?.toISOString(),
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
          return arrs?.flat(2)?.map((tag: ITagHistoryData) => {
            return [tag.name, this.sortData(tag, 1, false)];
          });
        }),
        map((tags: [string, boolean][]) => {
          if (tags && tags?.length) {
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
        takeUntil(this.chartWrapService.chartWrapDestroy$),
      )
      .subscribe({
        next: () => this.nextTrigger(),
        error: (e: unknown) => this.errorTrigger(e),
      });
  }

  public getSingleData(opt: IVCDataOptions): void {
    const customOpt = this.chartService.getLineOptions(
      this.chartWrapService.chartId,
      opt.tag.tagName,
      this.isGroupLineStyle,
    )?.req;

    if (!this.selectedItems.find((tag) => tag.tagName === opt.tag.tagName)) {
      this.selectedItems.push(opt.tag);
    }
    this.chartWrapService.chartWrapLoading$.next(true);

    this.isChartDataDownloading = true;

    this.rtdbTagApiService
      .getTagHistoryByArray(
        [opt.tag.tagName],
        null,
        customOpt.pointsCount?.toString() ?? null,
        customOpt.date?.start?.toISOString(),
        customOpt.date?.end?.toISOString(),
        null,
      )
      .pipe(
        map((tag: ITagHistoryData[]) => [tag[0].name, this.sortData(tag[0], customOpt.exponent, false)]),
        map((tag: [string, boolean]) => {
          if (tag) {
            this.mapDataForChart(tag[0]);
          }
          return [tag];
        }),
        takeUntil(this.chartWrapService.chartWrapDestroy$),
      )
      .subscribe({
        next: () => this.nextTrigger(),
        error: (e) => this.errorTrigger(e),
      });
  }

  public updateData(): void {
    forkJoin(
      this.selectedItems.map((tag) => {
        const tagData = this.dataMap.get(tag.tagName);
        const lastDate = tagData?.[tagData.length - 1]?.[0] as Date;
        const opt: IVCDataOptions = {
          pointsCount: 0,
          date: {
            start: lastDate || new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
            end: new Date(),
          },
          isExistData: true,
        };
        return this.rtdbTagApiService.getTagHistoryByArray(
          [tag.tagName],
          null,
          opt.pointsCount?.toString() ?? null,
          opt.date?.start?.toISOString(),
          opt.date?.end?.toISOString(),
          null,
        );
      }),
    )
      .pipe(
        map((arrs) => {
          return arrs?.flat(2)?.map((tag: ITagHistoryData) => {
            return [tag.name, this.sortData(tag, 1, true)];
          });
        }),
        map((tags: [string, boolean][]) => {
          if (tags && tags?.length) {
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
        takeUntil(this.chartWrapService.chartWrapDestroy$),
      )
      .subscribe({
        next: () => this.nextTrigger(true),
        error: (e) => this.errorTrigger(e),
      });
  }

  public drawTagByPlayer(tags: ITagsValues[]): void {
    this.selectedItems.forEach((tag) => {
      const tagData = tags.find((t) => t.name === tag.tagName);
      if (tagData?.val) {
        this.isChartDataDownloading = false;
        let index = -1;
        if (this.chartData.find((t) => t.name === tag.tagName)) {
          index = this.chartData.findIndex((t) => t.name === tag.tagName);
        }
        if (index === -1) {
          this.chartData.push({
            name: tag.tagName,
            id: tag.tagName,
            data: [this.viewerMapperService.prepareTagDataMapWS(tagData)],
            color: this.chartColorService.getColor(
              this.selectedItems.findIndex((t) => t.tagName === tag.tagName),
              1,
            ),
          });
        } else {
          this.chartData[index].data = [
            ...this.chartData[index].data,
            this.viewerMapperService.prepareTagDataMapWS(tagData),
          ];
        }
      }
    });
    this.nextTrigger(true);
  }

  public sortData(tag: ITagHistoryData, exponent: number = 1, isExistData: boolean = false): boolean {
    let existData: TluiLCLineInputData[] = [];

    if (isExistData) {
      existData = this.dataMap.get(tag.name) ?? [];
    }

    const value: TluiLCLineInputData[] = [];
    const data = tag.points;
    if (!(data && data?.length)) {
      return false;
    }
    data.reverse().forEach((d) => value.push(this.viewerMapperService.prepareTagDataMapRest(d, exponent)));
    this.dataMap.set(tag.name, [...existData, ...value]);
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
        color: this.chartColorService.getColor(
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

  public errorTrigger(e): void {
    this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    this.isChartDataDownloading = false;
    this.chartWrapService.chartWrapLoading$.next(false);
  }
}
