/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { ITagObjectChart, IVCLayerDataLineViewOptions, IVCSettingsPopup } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import { ViewerTagService } from '../../../../pure-modules';
import {
  ChartColorService,
  ChartOptionsService,
  ChartPageTagsService,
  ChartService,
  ChartSettingComponent,
  ChartWrapService,
} from '../../../chart-module';
import { ChartPageDataService } from '../../services';

/**  @deprecated use MnemoChartPageModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-tag-list',
  templateUrl: './chart-tag-list.component.html',
  styleUrl: './chart-tag-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartTagListComponent implements OnInit {
  private readonly document = inject<Document>(DOCUMENT);
  private readonly chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);
  public cPDataService = inject(ChartPageDataService);
  private readonly cpTagsService = inject(ChartPageTagsService);
  private readonly popupService = inject(PopupService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly chartOptionsService = inject(ChartOptionsService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.cPDataService.reSelectTags$.pipe(takeUntilDestroyed(this)).subscribe((tags) => this.reSelect(tags));
  }

  public getPredictorColor(indexParam: number): string {
    const value = this.cPDataService.activeTagMap.get(indexParam);
    const idx = this.cPDataService.getSelectedTags().findIndex((item) => item.tagName === value.tagName);
    return this.chartColorService.getColor(idx, 1);
  }

  public selectPredictor(item: ITagObjectChart): void {
    const selected = this.cPDataService.getSelectedTags();
    const { isActive } = item;
    if (selected?.length > this.cPDataService.maxSelectedCount - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.cpTagsService.clear();
    }

    item.isActive = !isActive;

    if (!item.isActive) {
      this.chartService.deleteLineOptions(this.chartWrapService.chartId, item.tagName, false);
    }

    this.cPDataService.drawChart();
  }

  public openSettingPopup(e: MouseEvent, item: ITagObjectChart, index: number): void {
    e.preventDefault();
    e.stopPropagation();

    const itemOpt: {
      view: IVCLayerDataLineViewOptions;
      req: IVCSettingsPopup;
    } = this.chartService.getLineOptions(this.chartWrapService.chartId, item.tagName, false);

    this.popupService
      .open(
        ChartSettingComponent,
        {
          trendOpt: {
            layerDataViewOptions: itemOpt?.view ?? {
              ...this.chartService.lineDefaultOptions,
              dataPointColor: this.getPredictorColor(index),
              breakPointColor: this.getPredictorColor(index),
            },
          },
          reqOpt: {
            date: itemOpt?.req.date ?? this.cPDataService.date,
            pointsCount: itemOpt?.req.pointsCount ?? this.cPDataService.pointsCount,
            exponent: itemOpt?.req.exponent ?? 1,
            data: this.cpTagsService.dataMap?.get(item.tagName),
            sourceType: 'tag',
            name: item.tagName,
          },
        },
        {
          width: this.document.defaultView.innerWidth * 0.8,
          height: this.document.defaultView.innerHeight * 0.8,
          positions: [
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'center',
              overlayY: 'center',
            },
          ],
        },
      )
      .popupRef.afterClosed()
      .subscribe((opt: { trendOpt: IVCLayerDataLineViewOptions; reqOpt: IVCSettingsPopup; reset: boolean }) => {
        if (opt?.reqOpt) {
          if (opt?.reset) {
            this.chartService.setLineOptions(
              this.chartWrapService.chartId,
              item.tagName,
              {
                view: this.chartService.lineDefaultOptions,
                req: opt.reqOpt,
              },
              false,
            );
          } else if (opt?.trendOpt) {
            this.chartService.setLineOptions(
              this.chartWrapService.chartId,
              item.tagName,
              {
                view: opt.trendOpt,
                req: opt.reqOpt,
              },
              false,
            );
            if (opt.trendOpt?.separateLayer) {
              this.setSeparateLayer(item);
            }
          }

          this.chartWrapService.chartWrapTag$.next({
            tag: item,
          });
        }
      });
  }

  public checkSetting(name: string): boolean {
    return !this.cpTagsService.dataMap.get(name);
  }

  public reSelect(tags: { tagName: string }[]): void {
    setTimeout(() => {
      tags.forEach((tag) => {
        const index = this.viewerTagService.tagsNamesOnly$.value.findIndex((t) => t === tag.tagName);
        if (index !== -1) {
          this.selectPredictor(this.cPDataService.activeTagMap.get(index));
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
      this.cpTagsService.selectedItems.find((t) => t.tagName === name) && !this.cpTagsService.dataMap.get(name)?.length
    );
  }

  public isChanged(name: string): boolean {
    return !!this.chartService.getLineOptions(this.chartWrapService.chartId, name, false);
  }

  public isSeparateLayer(name: string): boolean {
    return !!this.chartService.getLineOptions(this.chartWrapService.chartId, name, false)?.view?.separateLayer;
  }

  private setSeparateLayer(item: ITagObjectChart): void {
    this.chartWrapService.layerNames.push(item.tagName);
    const style = this.chartOptionsService.getDefaultLayerOptions(this.chartWrapService.layerNames?.length);
    const color = this.getPredictorColor(item.index);
    style.axisX.textColor = color;
    style.axisY.textColor = color;
    this.chartService.layerOptions.set(`${this.chartWrapService.chartId}-${item.tagName}`, style);
  }
}
