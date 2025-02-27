/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../consts';
import { IMnemoChartTrendSettingModel, ITagObjectChart } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import { MnemoTrendSettingPopupComponent, ViewerTagService } from '../../../../pure-modules';
import {
  MnemoChartColorService,
  MnemoChartService,
  MnemoChartTagsService,
  MnemoChartWrapService,
} from '../../../mnemo-chart-module/services';
import { MnemoChartPageDataService } from '../../services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-tag-list-2',
  templateUrl: './chart-tag-list.component.html',
  styleUrl: './chart-tag-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartTagListComponent implements OnInit {
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  public mnemoChartPageDataService = inject(MnemoChartPageDataService);
  private readonly mnemoChartService = inject(MnemoChartService);
  private readonly mnemoChartColorService = inject(MnemoChartColorService);
  private readonly mnemoChartTagsService = inject(MnemoChartTagsService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly popupService = inject(PopupService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.mnemoChartPageDataService.reSelectTags$
      .pipe(takeUntilDestroyed(this))
      .subscribe((tags) => this.reSelect(tags));
  }

  public getPredictorColor(indexParam: number): string {
    const value = this.mnemoChartPageDataService.activeTagMap.get(indexParam);
    const idx = this.mnemoChartPageDataService.getSelectedTags().findIndex((item) => item.tagName === value.tagName);
    return this.mnemoChartColorService.getColor(idx, 1);
  }

  public selectPredictor(item: ITagObjectChart): void {
    const selected = this.mnemoChartPageDataService.getSelectedTags();
    const { isActive } = item;
    const maxSelected =
      this.mnemoChartPageDataService.viewForm?.value?.maxSelectedTrend ??
      MNEMO_CHART_DEFAULT_VIEW_OPTIONS.maxSelectedTrend;
    if (selected?.length > maxSelected - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.mnemoChartTagsService.clear();
    }

    item.isActive = !isActive;

    if (!item.isActive) {
      this.mnemoChartService.deleteTrendOptions(this.mnemoChartWrapService.chartId, item.tagName);
      this.mnemoChartService.deleteRequestOptions(this.mnemoChartWrapService.chartId, item.tagName);
      this.mnemoChartService.deleteViewOptions(this.mnemoChartWrapService.chartId, item.tagName);
      this.mnemoChartService.deleteSeparateTrendOptions(this.mnemoChartWrapService.chartId, item.tagName);
    }

    this.mnemoChartPageDataService.drawChart();
  }

  public openSettingPopup(e: MouseEvent, item: ITagObjectChart): void {
    e.preventDefault();
    e.stopPropagation();
    const data = {
      trendSetting: this.mnemoChartService.getTrendOptions(this.mnemoChartWrapService.chartId, item.tagName) ?? {
        config: {},
        common: {},
      },
      requestSetting: this.mnemoChartService.getRequestOptions(this.mnemoChartWrapService.chartId, item.tagName) ?? {
        points: this.mnemoChartPageDataService.requestForm.value?.points,
        date: this.mnemoChartPageDataService.requestForm.value?.date,
        hoursPeriod: this.mnemoChartPageDataService.requestForm.value?.hoursPeriod,
      },
      viewSettings: this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, item.tagName) ?? {
        maxSelectedTrend: this.mnemoChartPageDataService.viewForm.value?.autoZoom,
        autoZoom: this.mnemoChartPageDataService.viewForm.value?.autoZoom,
        autoZoomAxisActiveState: this.mnemoChartPageDataService.viewForm.value?.autoZoomAxisActiveState,
        exponent: this.mnemoChartPageDataService.viewForm.value?.exponent,
      },
      trendName: item.tagName,
      isSeparateTrend:
        this.mnemoChartService.getSeparateTrendOptions(this.mnemoChartWrapService.chartId, item.tagName) ?? false,
      chartData: this.mnemoChartTagsService.dataMap.get(item.tagName),
    } as unknown as IMnemoChartTrendSettingModel;

    console.log('data', data);

    this.popupService
      .open(MnemoTrendSettingPopupComponent, data)
      .popupRef.afterClosed()
      .subscribe((options: IMnemoChartTrendSettingModel) => {
        if (!options || JSON.stringify(options) === JSON.stringify(data)) return;
        this.mnemoChartService.setTrendOptions(options?.trendOptions, this.mnemoChartWrapService.chartId, item.tagName);
        this.mnemoChartService.setRequestOptions(
          options?.requestOptions,
          this.mnemoChartWrapService.chartId,
          item.tagName,
        );
        this.mnemoChartService.setViewOptions(options?.viewOptions, this.mnemoChartWrapService.chartId, item.tagName);
        this.mnemoChartService.setSeparateTrendOptions(
          this.mnemoChartWrapService.chartId,
          item.tagName,
          options?.isSeparateTrend,
        );
        this.mnemoChartWrapService.chartWrapTag$.next({
          tags: [item],
          date: options?.requestOptions?.date ?? data.requestOptions.date,
          fixedPoints: options?.requestOptions?.fixedPoints !== false,
          points: options?.requestOptions?.points ?? data.requestOptions.points,
        });
      });
  }

  public checkSetting(name: string): boolean {
    return !this.mnemoChartTagsService.dataMap.get(name);
  }

  public reSelect(tags: { tagName: string }[]): void {
    setTimeout(() => {
      tags.forEach((tag) => {
        const index = this.viewerTagService.tagsNamesOnly$.value.findIndex((t) => t === tag.tagName);
        if (index !== -1) {
          this.selectPredictor(this.mnemoChartPageDataService.activeTagMap.get(index));
        }
      });
      this.cdr.markForCheck();
    }, 2000);
  }

  public catchEvent(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  public isEmptyData(name: string): boolean {
    return (
      this.mnemoChartTagsService.selectedItems.find((t) => t.tagName === name) &&
      !this.mnemoChartTagsService.dataMap.get(name)?.length
    );
  }

  public isChanged(name: string): boolean {
    return !!this.mnemoChartService.getTrendOptions(this.mnemoChartWrapService.chartId, name);
  }

  public isSeparateLayer(name: string): boolean {
    return this.mnemoChartService.getSeparateTrendOptions(this.mnemoChartWrapService.chartId, name);
  }
}
