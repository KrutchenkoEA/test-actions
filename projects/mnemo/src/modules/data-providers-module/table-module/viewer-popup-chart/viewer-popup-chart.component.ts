/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { TLUI_LC_COLORS_LIST } from '@tl-platform/ui';
import { BehaviorSubject, debounceTime, filter, forkJoin, switchMap, throttleTime } from 'rxjs';
import { map } from 'rxjs/operators';
import { popup } from '../../../../consts';
import {
  ChartDataType,
  IChartData,
  IChartOptions,
  ITagHistoryData,
  ITagObjectChart,
  ITagsValues,
  IVCDataOptions,
  LineType,
  LineTypesType,
} from '../../../../models';
import { MnemoLoggerService, POPUP_DIALOG_DATA, PopupReference, RtdbTagApiService } from '../../../../services';
import { ChartColorService, ChartService, MNEMO_CHARTS_COLORS_LIST } from '../../../additional-modules';
import {
  PlayerModeService,
  PlayerService,
  ViewerMapperService,
  ViewerService,
  ViewerTagService,
} from '../../../pure-modules';
import { ViewerPopupChartService } from './viewer-popup-chart.service';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-viewer-popup-chart',
  templateUrl: './viewer-popup-chart.component.html',
  styleUrls: ['./viewer-popup-chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TLUI_LC_COLORS_LIST, useValue: MNEMO_CHARTS_COLORS_LIST }],
  animations: [popup],
})
export class ViewerPopupChartComponent implements OnInit {
  readonly data = inject<IChartOptions>(POPUP_DIALOG_DATA);
  private readonly viewerService = inject(ViewerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly chartService = inject(ChartService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly popupChartService = inject(ViewerPopupChartService);
  private readonly popupRef = inject<PopupReference<ViewerPopupChartComponent>>(PopupReference);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly playerService = inject(PlayerService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public width: number = window.innerWidth * 0.55;
  public height: number = window.innerHeight * 0.7;
  public baseUrl: string = this.viewerService.baseUrl;

  public selectedTagNames: ITagObjectChart[] = [];
  public chartsData: IChartData[] = [];
  public chartNameForTitle: string = 'chart1';

  public lineType: LineType = 'curveLinear';
  public isLoadingChart$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private lineTypes: LineTypesType = 'lineType1$';
  private isFullScreen: boolean = false;
  private readonly tagDataMap: Map<string, ChartDataType[]> = new Map<string, ChartDataType[]>();

  public ngOnInit(): void {
    this.width = this.data.width;
    this.height = this.data.height;

    this.getChartName();

    this.viewerTagService.updateTagData$
      .pipe(
        filter(() => !(this.playerModeService.isPlayerMode || this.isLoadingChart$.value)),
        takeUntilDestroyed(this),
      )
      .subscribe(() => {
        if (!this.selectedTagNames.length) {
          return;
        }
        this.updateAllTagData();
      });

    this.viewerTagService.updateTagDataPlayer$.pipe(throttleTime(1000), takeUntilDestroyed(this)).subscribe((tags) => {
      if (!this.selectedTagNames.length) {
        return;
      }
      this.drawTagByPlayer(tags);
    });

    this.playerModeService.isPlayerMode$.pipe(takeUntilDestroyed(this)).subscribe(() => {
      this.isLoadingChart$.next(true);
      this.chartsData = [];
      this.tagDataMap.clear();
      setTimeout(() => this.isLoadingChart$.next(false), 2000);
      this.changeDetectorRef.markForCheck();
    });

    this.playerService.currentPositionChanged$
      .pipe(
        filter(() => !!this.playerModeService.isPlayerMode),
        takeUntilDestroyed(this),
      )
      .subscribe(() => {
        this.isLoadingChart$.next(true);
        this.chartsData = [];
        setTimeout(() => this.isLoadingChart$.next(false));
        this.changeDetectorRef.markForCheck();
      });

    this.popupChartService.pointsCount$
      .pipe(
        debounceTime(800),
        filter((d) => !!d && !!this.selectedTagNames.length),
        takeUntilDestroyed(this),
      )
      .subscribe((c) => {
        const opt: IVCDataOptions = {
          tags: this.selectedTagNames,
          pointsCount: c,
          date: { start: null, end: null },
          isExistData: false,
        };
        this.getAllTagData(opt);
      });

    this.popupChartService[this.data?.chartName]
      .pipe(debounceTime(800), takeUntilDestroyed(this))
      .subscribe((tagNames) => {
        if (!(tagNames && tagNames?.length)) {
          this.isLoadingChart$.next(false);
          return;
        }
        // todo
        // @ts-ignore
        const opt: IVCDataOptions = this.popupChartService.pointsCount$.value
          ? {
            tags: tagNames.map((t) => {
              return { tagName: t, isUser: false };
            }),
            pointsCount: this.popupChartService.pointsCount$.value,
            date: { start: null, end: null },
            isExistData: false,
          }
          : {
            tags: tagNames.map((t) => {
              return { tagName: t, isUser: false };
            }),
            pointsCount: 0,
            date: {
              start: new Date(new Date().setHours(new Date().getHours() - 8)),
              end: new Date(),
            },
            isExistData: false,
          };
        this.selectedTagNames = opt.tags;
        if (!this.playerModeService.isPlayerMode) {
          setTimeout(() => this.getAllTagData(opt));
        }
      });

    this.chartService[this.lineTypes]
      .pipe(
        debounceTime(800),
        filter((d) => !!d),
        takeUntilDestroyed(this),
      )
      .subscribe((type) => {
        this.lineType = type;
        this.isLoadingChart$.next(true);
        this.selectedTagNames.forEach((tag) => this.mapDataForChart(tag.tagName));
        setTimeout(() => this.isLoadingChart$.next(false));
        this.changeDetectorRef.markForCheck();
      });
  }

  public changeChartSize(): void {
    this.isFullScreen = !this.isFullScreen;
    if (this.isFullScreen) {
      this.width = window.innerWidth * 0.85;
      this.height = window.innerHeight * 0.85;
    } else {
      this.width = this.data.width;
      this.height = this.data.height;
    }
    this.popupRef.updatePopupPosition();
    this.reDraw();
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public getColor(idx: number): string {
    return this.chartColorService.getColor(idx);
  }

  private getAllTagData(opt: IVCDataOptions): void {
    this.isLoadingChart$.next(true);
    this.tagDataMap.clear();
    this.changeDetectorRef.markForCheck();

    const names: string[] = [];
    opt.tags.map((t) => names.push(t.tagName));
    this.rtdbTagApiService
      .getTagHistoryByArray(
        names,
        null,
        opt.pointsCount?.toString() ?? null,
        opt.date?.start?.toISOString(),
        opt.date?.end?.toISOString(),
      )
      .pipe(
        map((arrs) => {
          return arrs.map((tag: ITagHistoryData) => {
            return [tag.name, this.sortData(tag, 1, false)];
          });
        }),
        switchMap((tags: [string, boolean][]) => {
          if (tags && tags?.length) {
            tags.forEach((tag) => {
              this.mapDataForChart(tag[0]);
            });
          }
          return [tags];
        }),
        takeUntilDestroyed(this),
      )
      .subscribe({
        next: () => {
          this.isLoadingChart$.next(false);
          this.changeDetectorRef.markForCheck();
        },
        error: (e) => {
          this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e, false);
          this.isLoadingChart$.next(false);
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private updateAllTagData(): void {
    forkJoin(
      this.selectedTagNames.map((tag) => {
        const tagData = this.tagDataMap.get(tag.tagName);
        const lastDate = tagData?.[tagData.length - 1]?.[0] as unknown as Date;
        const opt: IVCDataOptions = {
          pointsCount: 0,
          date: {
            start: lastDate || new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
            end: new Date(),
          },
          isExistData: true,
        };
        return this.rtdbTagApiService
          .getTagHistoryByArray(
            [tag.tagName],
            null,
            opt.pointsCount?.toString() ?? null,
            opt.date?.start?.toISOString(),
            opt.date?.end?.toISOString(),
          )
          .pipe(map((data: ITagHistoryData[]) => [data[0].name, this.sortData(data[0], opt.exponent, true)]));
      }),
    )
      .pipe(
        switchMap((tags: [string, boolean][]) => {
          if (tags && tags?.length) {
            tags.forEach((tag) => {
              this.mapDataForChart(tag[0]);
            });
          }
          return [tags];
        }),
        takeUntilDestroyed(this),
      )
      .subscribe({
        next: () => {
          this.isLoadingChart$.next(false);
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.isLoadingChart$.next(false);
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private sortData(tag: ITagHistoryData, exponent: number = 1, isExistData: boolean = false): boolean {
    let existData: ChartDataType[] = [];

    if (isExistData) {
      existData = this.tagDataMap.get(tag.name) ?? [];
    }

    const value: ChartDataType[] = [];
    const data = tag.points;
    if (!(data && data.length)) {
      return false;
    }
    data
      .reverse()
      .forEach((d) => value.push(<[number, number]> this.viewerMapperService.prepareTagDataMapRest(d, exponent)));
    this.tagDataMap.set(tag.name, [...existData, ...value]);
    return true;
  }

  private mapDataForChart(tagName: string): void {
    if (this.playerModeService.isPlayerMode) {
      return;
    }

    let index = -1;
    if (this.chartsData.find((t) => t.name === tagName)) {
      index = this.selectedTagNames.findIndex((t) => t.tagName === tagName);
    }
    const tagData = this.tagDataMap.get(tagName);
    if (index === -1) {
      this.chartsData.push({
        name: tagName,
        data: tagData,
        lineType: this.lineType,
      });
    } else {
      this.chartsData[index].data = tagData;
      this.chartsData[index].lineType = this.lineType;
    }
  }

  private drawTagByPlayer(tags: ITagsValues[]): void {
    this.selectedTagNames.forEach((tag) => {
      const tagData = tags.find((t) => t.name === tag.tagName);
      if (tagData.val) {
        this.isLoadingChart$.next(false);
        let index = -1;
        if (this.chartsData.find((t) => t.name === tag.tagName)) {
          index = this.selectedTagNames.findIndex((t) => t.tagName === tag.tagName);
        }
        if (index === -1) {
          this.chartsData.push({
            name: tag.tagName,
            data: [this.viewerMapperService.prepareTagDataMapWS(tagData)],
            lineType: this.lineType,
          });
        } else {
          this.chartsData[index].data = [
            ...this.chartsData[index].data,
            this.viewerMapperService.prepareTagDataMapWS(tagData),
          ];
          this.chartsData[index].lineType = this.lineType;
        }
      } else {
        this.isLoadingChart$.next(true);
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  private reDraw(): void {
    this.isLoadingChart$.next(true);
    if (!this.playerModeService.isPlayerMode) {
      this.selectedTagNames.forEach((tag) => this.mapDataForChart(tag.tagName));
    }
    setTimeout(() => this.isLoadingChart$.next(false));
    this.changeDetectorRef.markForCheck();
  }

  private getChartName(): void {
    switch (this.data.chartName) {
      case 'chartTags1$':
        this.chartNameForTitle = 'chart1';
        this.lineTypes = 'lineType1$';
        break;
      case 'chartTags2$':
        this.chartNameForTitle = 'chart2';
        this.lineTypes = 'lineType2$';
        break;
      case 'chartTags3$':
        this.chartNameForTitle = 'chart3';
        this.lineTypes = 'lineType3$';
        break;
      default:
        break;
    }
  }
}
