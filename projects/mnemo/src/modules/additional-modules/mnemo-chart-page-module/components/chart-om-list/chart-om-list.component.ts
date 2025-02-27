/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../consts';
import { DataType, IMnemoChartTrendSettingModel, IOmObjectChart } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import { MnemoTrendSettingPopupComponent } from '../../../../pure-modules';
import {
  MnemoChartColorService,
  MnemoChartOmService,
  MnemoChartService,
  MnemoChartWrapService,
} from '../../../mnemo-chart-module/services';
import { MnemoChartPageDataService } from '../../services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-om-list-2',
  templateUrl: './chart-om-list.component.html',
  styleUrl: './chart-om-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartOmListComponent implements OnInit {
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  public mnemoChartPageDataService = inject(MnemoChartPageDataService);
  private readonly mnemoChartService = inject(MnemoChartService);
  private readonly mnemoChartColorService = inject(MnemoChartColorService);
  private readonly mnemoChartOmService = inject(MnemoChartOmService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly popupService = inject(PopupService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.mnemoChartPageDataService.reSelectOmAttr$
      .pipe(takeUntilDestroyed(this))
      .subscribe((attr) => this.reSelect(attr));
  }

  public getPredictorColor(indexParam: number): string {
    const value = this.mnemoChartPageDataService.activeOmAttrMap.get(indexParam);
    const idx = this.mnemoChartPageDataService
      .getSelectedOmAttr()
      .findIndex((item) => item.attrGuid === value.attrGuid);
    return this.mnemoChartColorService.getColor(idx, 2);
  }

  public selectPredictor(item: IOmObjectChart): void {
    if (!item) return;
    const selected = this.mnemoChartPageDataService.getSelectedOmAttr();
    const { isActive } = item;
    const maxSelected =
      this.mnemoChartPageDataService.viewForm?.value?.maxSelectedTrend ??
      MNEMO_CHART_DEFAULT_VIEW_OPTIONS.maxSelectedTrend;

    if (selected?.length > maxSelected - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.mnemoChartOmService.clear();
    }

    item.isActive = !isActive;

    if (!item.isActive) {
      this.mnemoChartService.deleteTrendOptions(this.mnemoChartWrapService.chartId, item.attrGuid);
      this.mnemoChartService.deleteRequestOptions(this.mnemoChartWrapService.chartId, item.attrGuid);
      this.mnemoChartService.deleteViewOptions(this.mnemoChartWrapService.chartId, item.attrGuid);
      this.mnemoChartService.deleteSeparateTrendOptions(this.mnemoChartWrapService.chartId, item.attrGuid);
    }

    this.mnemoChartPageDataService.drawChart();
  }

  public openSettingPopup(e: MouseEvent, attr: IOmObjectChart): void {
    e.preventDefault();
    e.stopPropagation();

    const data = {
      trendSetting: this.mnemoChartService.getTrendOptions(this.mnemoChartWrapService.chartId, attr.attrGuid) ?? {
        config: {},
        common: {},
      },
      requestSetting: this.mnemoChartService.getRequestOptions(this.mnemoChartWrapService.chartId, attr.attrGuid) ?? {
        points: this.mnemoChartPageDataService.requestForm.value?.points,
        date: this.mnemoChartPageDataService.requestForm.value?.date,
        hoursPeriod: this.mnemoChartPageDataService.requestForm.value?.hoursPeriod,
      },
      viewSettings: this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId, attr.attrGuid) ?? {
        maxSelectedTrend: this.mnemoChartPageDataService.viewForm.value?.autoZoom,
        autoZoom: this.mnemoChartPageDataService.viewForm.value?.autoZoom,
        autoZoomAxisActiveState: this.mnemoChartPageDataService.viewForm.value?.autoZoomAxisActiveState,
        exponent: this.mnemoChartPageDataService.viewForm.value?.exponent,
      },
      trendName: attr.attrGuid,
      isSeparateTrend:
        this.mnemoChartService.getSeparateTrendOptions(this.mnemoChartWrapService.chartId, attr.attrGuid) ?? false,
      chartData: this.mnemoChartOmService.dataMap.get(attr.attrGuid),
    } as unknown as IMnemoChartTrendSettingModel;

    this.popupService
      .open(MnemoTrendSettingPopupComponent, data)
      .popupRef.afterClosed()
      .subscribe((options: IMnemoChartTrendSettingModel) => {
        if (!options || JSON.stringify(options) === JSON.stringify(data)) return;
        this.mnemoChartService.setTrendOptions(
          options?.trendOptions,
          this.mnemoChartWrapService.chartId,
          attr.attrGuid,
        );
        this.mnemoChartService.setRequestOptions(
          options?.requestOptions,
          this.mnemoChartWrapService.chartId,
          attr.attrGuid,
        );
        this.mnemoChartService.setViewOptions(options?.viewOptions, this.mnemoChartWrapService.chartId, attr.attrGuid);
        this.mnemoChartService.setSeparateTrendOptions(
          this.mnemoChartWrapService.chartId,
          attr.attrGuid,
          options?.isSeparateTrend,
        );
        this.mnemoChartWrapService.chartWrapOmAttr$.next({
          omAttributes: [attr],
          date: options?.requestOptions?.date ?? data.requestOptions.date,
          fixedPoints: options?.requestOptions?.fixedPoints !== false,
          points: options?.requestOptions?.points ?? data.requestOptions.points,
        });
      });
  }

  public checkSetting(attGuid: string): boolean {
    return !this.mnemoChartOmService.dataMap.get(attGuid);
  }

  public reSelect(attr: IOmObjectChart[]): void {
    setTimeout(() => {
      attr.forEach((t) => this.selectPredictor(this.mnemoChartPageDataService.activeOmAttrMap.get(t.index)));
      this.cdr.markForCheck();
    }, 2000);
  }

  public catchEvent(e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
  }

  public getAttrType(attrType: number): DataType {
    switch (attrType) {
      case 1:
        return 'Константа';
      case 2:
        return 'Тег';
      case 3:
        return 'Формула';
      case 4:
        return 'SQL';
      case 5:
        return 'Ссылка';
      default:
        return undefined;
    }
  }

  public isEmptyData(attrGuid: string): boolean {
    return (
      this.mnemoChartOmService.selectedItems.find((t) => t.attrGuid === attrGuid) &&
      !this.mnemoChartOmService.dataMap.get(attrGuid)?.length
    );
  }

  public isChanged(attrGuid: string): boolean {
    return !!this.mnemoChartService.getTrendOptions(this.mnemoChartWrapService.chartId, attrGuid);
  }

  public isSeparateLayer(attrGuid: string): boolean {
    return this.mnemoChartService.getSeparateTrendOptions(this.mnemoChartWrapService.chartId, attrGuid);
  }
}
