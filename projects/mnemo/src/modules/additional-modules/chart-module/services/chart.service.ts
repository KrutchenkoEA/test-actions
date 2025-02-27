/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import {
  IVCLayerDataLineViewOptions,
  IVCLayerViewOptions,
  IVCSettingsPopup,
  IVCViewOpt,
  LineType,
} from '../../../../models';
import { ChartOptionsService } from './chart-options.service';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartService {
  private readonly chartOptionsService = inject(ChartOptionsService);

  // мапы стилей
  public chartOptions: Map<string, IVCViewOpt> = new Map<string, IVCViewOpt>(); // <chartId, data>
  public layerOptions: Map<string, IVCLayerViewOptions> = new Map<string, IVCLayerViewOptions>(); // <chartId+'-'+layerTitle, data>>
  public lineDefaultOptions: IVCLayerDataLineViewOptions = this.chartOptionsService.getDefaultLayerDataOptions();
  public lines: LineType[] = [
    'curveBasis',
    'curveLinear',
    'curveMonotoneX',
    'curveMonotoneY',
    'curveNatural',
    'curveStep',
    'curveStepAfter',
    'curveStepBefore',
  ];

  //
  private readonly lineOptions: Map<
    string,
    {
      view: IVCLayerDataLineViewOptions;
      req: IVCSettingsPopup;
    }
  > = new Map<string, { view: IVCLayerDataLineViewOptions; req: IVCSettingsPopup }>();

  public getLineOptions(
    chartId: string,
    name: string,
    isGroup: boolean = false
  ): {
    view: IVCLayerDataLineViewOptions;
    req: IVCSettingsPopup;
  } {
    return isGroup ? this.lineOptions.get(chartId) : this.lineOptions.get(`${chartId}-${name}`);
  }

  public setLineOptions(
    chartId: string,
    name: string,
    data: {
      view: IVCLayerDataLineViewOptions;
      req: IVCSettingsPopup;
    },
    isGroup: boolean = false
  ): void {
    if (isGroup) {
      this.lineOptions.set(chartId, data);
    } else {
      this.lineOptions.set(`${chartId}-${name}`, data);
    }
  }

  public deleteLineOptions(chartId: string, name: string, isGroup: boolean = false): boolean {
    return isGroup ? this.lineOptions.delete(chartId) : this.lineOptions.delete(`${chartId}-${name}`);
  }

  public cleanOptions(): void {
    this.chartOptions.clear();
    this.layerOptions.clear();
    this.lineOptions.clear();
    this.lineDefaultOptions = this.chartOptionsService.getDefaultLayerDataOptions();
  }

  public resetOptions(chartId: string, layerNames: string[]): void {
    this.chartOptions.set(chartId, this.chartOptionsService.getDefaultChartOptions());
    layerNames.forEach((l, i) =>
      this.layerOptions.set(`${chartId}-${l}`, this.chartOptionsService.getDefaultLayerOptions(i))
    );
    this.lineOptions.clear();
    this.lineDefaultOptions = this.chartOptionsService.getDefaultLayerDataOptions();
  }

  public refreshColors(isDarkTheme: boolean): void {
    this.layerOptions?.forEach((l) => {
      l.axisX.color = this.chartOptionsService.refreshAxis(l.axisX.color, isDarkTheme);
      l.axisY.color = this.chartOptionsService.refreshAxis(l.axisY.color, isDarkTheme);
      l.axisX.textColor = this.chartOptionsService.refreshAxis(l.axisX.textColor, isDarkTheme);
      l.axisY.textColor = this.chartOptionsService.refreshAxis(l.axisY.textColor, isDarkTheme);
      l.gridX.color = this.chartOptionsService.refreshGrid(l.gridX.color, isDarkTheme);
      l.gridY.color = this.chartOptionsService.refreshGrid(l.gridY.color, isDarkTheme);
    });

    this.chartOptions?.forEach((c) => {
      c.tooltipColor = this.chartOptionsService.refreshTooltip(isDarkTheme);
    });
  }
}
