/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { DataType, IOmObjectChart, IVCLayerDataLineViewOptions, IVCSettingsPopup } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import {
  ChartColorService,
  ChartOptionsService,
  ChartPageOmService,
  ChartService,
  ChartSettingComponent,
  ChartWrapService,
} from '../../../chart-module';
import { ChartPageDataService } from '../../services';

/**  @deprecated use MnemoChartPageModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-om-list',
  templateUrl: './chart-om-list.component.html',
  styleUrl: './chart-om-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartOmListComponent implements OnInit {
  private readonly document = inject<Document>(DOCUMENT);
  private readonly chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);
  public cPDataService = inject(ChartPageDataService);
  private readonly cpOmService = inject(ChartPageOmService);
  private readonly popupService = inject(PopupService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly chartOptionsService = inject(ChartOptionsService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly cdr = inject(ChangeDetectorRef);

  public ngOnInit(): void {
    this.cPDataService.reSelectOmAttr$.pipe(takeUntilDestroyed(this)).subscribe((attr) => this.reSelect(attr));
  }

  public getPredictorColor(indexParam: number): string {
    const value = this.cPDataService.activeOmAttrMap.get(indexParam);
    const idx = this.cPDataService.getSelectedOmAttr().findIndex((item) => item.attrGuid === value.attrGuid);
    return this.chartColorService.getColor(idx, 2);
  }

  public selectPredictor(item: IOmObjectChart): void {
    if (!item) return;
    const selected = this.cPDataService.getSelectedOmAttr();
    const { isActive } = item;
    if (selected?.length > this.cPDataService.maxSelectedCount - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.cpOmService.clear();
    }

    item.isActive = !isActive;

    if (!item.isActive) {
      this.chartService.deleteLineOptions(this.chartWrapService.chartId, item.attrGuid, false);
    }

    this.cPDataService.drawChart();
  }

  public openSettingPopup(e: MouseEvent, attr: IOmObjectChart, index: number): void {
    e.preventDefault();
    e.stopPropagation();

    const itemOpt: {
      view: IVCLayerDataLineViewOptions;
      req: IVCSettingsPopup;
    } = this.chartService.getLineOptions(this.chartWrapService.chartId, attr.attrGuid, false);

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
            data: this.cpOmService.dataMap?.get(attr.attrGuid),
            sourceType: 'omAttr',
            name: attr.name,
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
              attr.attrGuid,
              {
                view: this.chartService.lineDefaultOptions,
                req: opt.reqOpt,
              },
              false,
            );
          } else if (opt?.trendOpt) {
            this.chartService.setLineOptions(
              this.chartWrapService.chartId,
              attr.attrGuid,
              {
                view: opt.trendOpt,
                req: opt.reqOpt,
              },
              false,
            );
            if (opt.trendOpt?.separateLayer) {
              this.setSeparateLayer(attr);
            }
          }

          this.chartWrapService.chartWrapOmAttr$.next({
            omAttribute: attr,
          });
        }
      });
  }

  public checkSetting(attGuid: string): boolean {
    return !this.cpOmService.dataMap.get(attGuid);
  }

  public reSelect(attr: IOmObjectChart[]): void {
    setTimeout(() => {
      attr.forEach((t) => this.selectPredictor(this.cPDataService.activeOmAttrMap.get(t.index)));
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
      this.cpOmService.selectedItems.find((t) => t.attrGuid === attrGuid) &&
      !this.cpOmService.dataMap.get(attrGuid)?.length
    );
  }

  public isChanged(attrGuid: string): boolean {
    return !!this.chartService.getLineOptions(this.chartWrapService.chartId, attrGuid, false);
  }

  public isSeparateLayer(attrGuid: string): boolean {
    return !!this.chartService.getLineOptions(this.chartWrapService.chartId, attrGuid, false)?.view?.separateLayer;
  }

  private setSeparateLayer(attr: IOmObjectChart): void {
    this.chartWrapService.layerNames.push(attr.attrGuid);
    const style = this.chartOptionsService.getDefaultLayerOptions(this.chartWrapService.layerNames?.length);
    const color = this.getPredictorColor(attr.index);
    style.axisX.textColor = color;
    style.axisY.textColor = color;
    this.chartService.layerOptions.set(`${this.chartWrapService.chartId}-${attr.attrGuid}`, style);
  }
}
