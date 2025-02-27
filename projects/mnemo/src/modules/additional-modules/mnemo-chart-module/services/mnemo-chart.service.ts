/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { ITluiChartSingleLayerInputModel } from '@tl-platform/ui';
import { IMnemoChartRequestOptions, IMnemoChartTrendSettingModel, IMnemoChartViewOptions } from '../../../../models';

@Injectable()
export class MnemoChartService {
  private readonly _requestOptions: Map<string, IMnemoChartRequestOptions> = new Map<
    string,
    IMnemoChartRequestOptions
  >(); // <chartId-name, data>

  private readonly _viewOptions: Map<string, IMnemoChartViewOptions> = new Map<string, IMnemoChartViewOptions>(); // <chartId, data>

  private readonly _chartOptions: Map<string, ITluiChartSingleLayerInputModel> = new Map<
    string,
    ITluiChartSingleLayerInputModel
  >(); // <chartId-name, data>

  private readonly _trendOptions: Map<string, ITluiChartSingleLayerInputModel['lineLayer']> = new Map<
    string,
    ITluiChartSingleLayerInputModel['lineLayer']
  >(); // <chartId-name, data>

  private readonly _separateTrendOptions: Map<string, boolean> = new Map<string, boolean>();

  // region RequestOptions
  public getRequestOptions(chartId: string, name: string = '', isGroup: boolean = true): IMnemoChartRequestOptions {
    return isGroup ? this._requestOptions.get(`${chartId}-${name}`) : this._requestOptions.get(chartId);
  }

  public setRequestOptions(
    data: IMnemoChartRequestOptions,
    chartId: string,
    name: string = '',
    isGroup: boolean = true
  ): void {
    if (isGroup) {
      this._requestOptions.set(`${chartId}-${name}`, data);
    } else {
      this._requestOptions.set(chartId, data);
    }
  }

  public deleteRequestOptions(chartId: string, name: string = '', isGroup: boolean = true): boolean {
    return isGroup ? this._requestOptions.delete(`${chartId}-${name}`) : this._requestOptions.delete(chartId);
  }

  // endregion

  // region ViewOptions
  public getViewOptions(chartId: string, name: string = '', isGroup: boolean = true): IMnemoChartViewOptions {
    return isGroup ? this._viewOptions.get(`${chartId}-${name}`) : this._viewOptions.get(chartId);
  }

  public setViewOptions(
    data: IMnemoChartViewOptions,
    chartId: string,
    name: string = '',
    isGroup: boolean = true
  ): void {
    if (isGroup) {
      this._viewOptions.set(`${chartId}-${name}`, data);
    } else {
      this._viewOptions.set(chartId, data);
    }
  }

  public deleteViewOptions(chartId: string, name: string = '', isGroup: boolean = true): boolean {
    return isGroup ? this._viewOptions.delete(`${chartId}-${name}`) : this._viewOptions.delete(chartId);
  }

  // endregion

  // region ChartOptions
  public getChartOptions(chartId: string, name: string = '', isGroup: boolean = true): ITluiChartSingleLayerInputModel {
    return isGroup ? this._chartOptions.get(`${chartId}-${name}`) : this._chartOptions.get(chartId);
  }

  public setChartOptions(
    data: ITluiChartSingleLayerInputModel,
    chartId: string,
    name: string = '',
    isGroup: boolean = true
  ): void {
    if (isGroup) {
      this._chartOptions.set(`${chartId}-${name}`, data);
    } else {
      this._chartOptions.set(chartId, data);
    }
  }

  public deleteChartOptions(chartId: string, name: string = '', isGroup: boolean = true): boolean {
    return isGroup ? this._chartOptions.delete(`${chartId}-${name}`) : this._chartOptions.delete(chartId);
  }

  // endregion

  // region TrendOptions
  public getTrendOptions(
    chartId: string,
    name: string = '',
    isGroup: boolean = true
  ): IMnemoChartTrendSettingModel['trendOptions'] {
    return isGroup ? this._trendOptions.get(`${chartId}-${name}`) : this._trendOptions.get(chartId);
  }

  public setTrendOptions(
    data: IMnemoChartTrendSettingModel['trendOptions'],
    chartId: string,
    name: string = '',
    isGroup: boolean = true
  ): void {
    if (isGroup) {
      this._trendOptions.set(`${chartId}-${name}`, data);
    } else {
      this._trendOptions.set(chartId, data);
    }
  }

  public deleteTrendOptions(chartId: string, name: string = '', isGroup: boolean = true): boolean {
    return isGroup ? this._trendOptions.delete(`${chartId}-${name}`) : this._trendOptions.delete(chartId);
  }

  // endregion

  // region SeparateTrendOptions
  public getSeparateTrendOptions(
    chartId: string,
    name: string,
    isGroup: boolean = false
  ): IMnemoChartTrendSettingModel['isSeparateTrend'] {
    return isGroup ? this._separateTrendOptions.get(`${chartId}-${name}`) : this._separateTrendOptions.get(chartId);
  }

  public setSeparateTrendOptions(
    chartId: string,
    name: string,
    data: IMnemoChartTrendSettingModel['isSeparateTrend'],
    isGroup: boolean = false
  ): void {
    if (isGroup) {
      this._separateTrendOptions.set(`${chartId}-${name}`, data);
    } else {
      this._separateTrendOptions.set(chartId, data);
    }
  }

  public deleteSeparateTrendOptions(chartId: string, name: string, isGroup: boolean = false): boolean {
    return isGroup
      ? this._separateTrendOptions.delete(`${chartId}-${name}`)
      : this._separateTrendOptions.delete(chartId);
  }

  // endregion

  public clearAllOptions(): void {
    this._requestOptions.clear();
    this._viewOptions.clear();
    this._chartOptions.clear();
    this._trendOptions.clear();
    this._separateTrendOptions.clear();
  }
}
