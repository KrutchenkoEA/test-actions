/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { TluiLCLineInputDataIconEnum } from '@tl-platform/ui';
import { sortByOrderFunction } from '../../../../../functions';
import {
  IDashboardRawData,
  IDashboardRawDataResult,
  IDataMappingOptions,
  IMultiLineChartOptions,
} from '../../../../../models';
import { MnemoLoggerService, RtdbFormulaApiService } from '../../../../../services';
import { ViewerMapperService } from '../../../../pure-modules';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesService } from './active-shapes.service';

/**  @deprecated todo remove */
@Injectable()
export class ActiveShapesRawOldService {
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  /**  @deprecated todo remove */
  public getRawDataCombChart(
    formula: string,
    tag: IDataMappingOptions,
    chartId: string,
    view: IMultiLineChartOptions = null
  ): void {
    this.activeShapesService.isLoading$.next(true);
    this.rtdbFormulaApiService.getCalcByFormula<IDashboardRawData>(formula).subscribe({
      // IFormulaCalcRes?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (res: any) => {
        if (!res?.result) {
          this.activeShapesService.isLoading$.next(false);
          return;
        }
        res.result?.forEach((r) => {
          this.parseLineBarComboChart(r, tag, chartId, view);
          this.activeShapesRealtimeService.nextRealtimeData();
          this.activeShapesService.isLoading$.next(false);
        });
      },
      error: (e) => {
        this.activeShapesService.isLoading$.next(false);
        this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.shared.error', e);
      },
    });
  }

  private parseLineBarComboChart(
    r: IDashboardRawDataResult,
    tag: IDataMappingOptions,
    chartId: string,
    view: IMultiLineChartOptions = null
  ): void {
    this.activeShapesRealtimeService.orderMap.set(chartId, new Map());
    const orderMapRef = this.activeShapesRealtimeService.orderMap.get(chartId);
    let j = 1;
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in r.ResArray) {
      if (r.ResArray[key]?.order) {
        orderMapRef.set(key, r.ResArray[key]?.order);
      }

      let data = [];

      if (view?.xLabelType === 'enum') {
        data = r.ResArray[key]?.value
          ?.sort((a, b) => sortByOrderFunction(a, b))
          ?.map((p, i) => this.viewerMapperService.prepareTagDataMapEnum(p, i)) as TluiLCLineInputDataIconEnum[];
      } else {
        data = r.ResArray[key]?.value
          ?.sort((a, b) => sortByOrderFunction(a, b))
          ?.map((p) => this.viewerMapperService.prepareTagDataMapRest(p));
      }

      this.activeShapesRealtimeService.rawDataMap.set(key + chartId, {
        name: key,
        sourceType: 'raw',
        sourceData: tag.sourceData,
        type: tag.type,
        interpolation: tag.interpolation,
        chartData: data,
        parentChartId: chartId,
        color: tag?.palette?.[j - 1] ?? this.activeShapesService.getDefaultColor(j - 1),
        palette: tag?.palette ?? this.activeShapesService.defaultPalette,
      });
      // eslint-disable-next-line no-plusplus
      j++;
    }
  }

  private parseStackBarComboChart(
    r: IDashboardRawDataResult,
    tag: IDataMappingOptions,
    chartId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    view: IMultiLineChartOptions = null
  ): void {
    this.activeShapesRealtimeService.orderMap.set(chartId, new Map());
    const orderMapRef = this.activeShapesRealtimeService.orderMap.get(chartId);
    let i = 1;
    const caption: string[] = [];
    const resMap = new Map();
    const chartData = [];

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in r.ResArray) {
      if (r.ResArray[key]?.order) {
        orderMapRef.set(key, r.ResArray[key]?.order);
      }
      caption.push(key?.toString());
    }

    if (orderMapRef?.size) {
      caption?.sort((a: string, b: string) => {
        return orderMapRef.get(a) >= orderMapRef.get(b) ? 1 : -1;
      });
    }

    caption?.forEach((key) => {
      if (i === 1) {
        r.ResArray[key]?.value?.forEach((item) => {
          resMap.set(item.time, [item.val]);
        });
      } else {
        r.ResArray[key]?.value?.forEach((item) => {
          resMap.get(item.time).push(item.val);
        });
      }
      // eslint-disable-next-line no-plusplus
      i++;
    });

    let j = 1;
    let type: 'time' | 'number' | 'enum' = 'time';
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, values] of resMap.entries()) {
      if (j === 1) {
        switch (Object.prototype.toString.call(key)) {
          case '[object Date]':
            type = 'time';
            break;
          case '[object String]':
            type = Object.prototype.toString.call(new Date(key)) === '[object Date]' ? 'time' : 'enum';
            break;
          case '[object Number]':
            type = 'number';
            break;
          default:
            break;
        }
      }
      switch (type) {
        case 'number':
          chartData.push([key, values, key]);
          break;
        case 'time':
          chartData.push([new Date(key), values, key]);
          break;
        case 'enum':
          chartData.push([j, values, key]);
          break;
        default:
          break;
      }
      // eslint-disable-next-line no-plusplus
      j++;
    }

    this.activeShapesRealtimeService.rawDataMap.set(tag.name, {
      name: tag.name,
      sourceType: 'raw',
      sourceData: tag.sourceData,
      type: tag.type,
      interpolation: tag.interpolation,
      chartData,
      caption,
      parentChartId: chartId,
      color: tag?.palette?.[j - 1] ?? this.activeShapesService.getDefaultColor(j - 1),
      palette: tag?.palette ?? this.activeShapesService.defaultPalette,
    });
  }
}
