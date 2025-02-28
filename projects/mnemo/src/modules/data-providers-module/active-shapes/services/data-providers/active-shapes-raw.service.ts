/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { DATES_GLOBAL$, IDatesInterval, StoreObservable } from '@tl-platform/core';
import { ITluiChartSingleLayerInputModel, TluiLCLineInputDataIconEnum, TluiSectorData } from '@tl-platform/ui';
import { sortByOrderFunction } from '../../../../../functions';
import {
  DataItemTypeEnum,
  IActiveShapeTableOptions,
  IDashboardRawData,
  IDashboardRawDataResult,
  IDataMappingOptions,
  IMnemoChartRequestOptions,
  IMultiLineChartOptions,
  IPieChartOptions,
  IRawQuerySourceData,
  IRawQuerySourceDataPlaceholder,
  ViewElementTypeEnum,
} from '../../../../../models';
import { MnemoLoggerService, RtdbFormulaApiService } from '../../../../../services';
import { ViewerMapperService } from '../../../../pure-modules';
import { ActiveShapesRawOldService } from './active-shapes-raw-old.service';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesService } from './active-shapes.service';

@Injectable()
export class ActiveShapesRawService {
  private readonly dates$ = inject<StoreObservable<IDatesInterval>>(DATES_GLOBAL$);
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly activeShapesRawOldService = inject(ActiveShapesRawOldService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public getRawQuery(
    dataItem: IDataMappingOptions,
    chartId: string,
    chartType: ViewElementTypeEnum,
    view: IMultiLineChartOptions | IPieChartOptions | IActiveShapeTableOptions | ITluiChartSingleLayerInputModel = null,
    requestOptions?: IMnemoChartRequestOptions | null,
  ): void {
    const date = this.getHeaderData(requestOptions);
    let queryString = (dataItem.sourceData as IRawQuerySourceData)?.queryString.slice();

    queryString?.match(/\{\{\w+\}\}/g)?.forEach((r) => {
      const item: IRawQuerySourceDataPlaceholder = (dataItem.sourceData as IRawQuerySourceData).placeholders.find(
        (p) => p.placeholder === r.slice(2, -2),
      );
      let { value } = item;

      if (item.placeholder === 'startTime' && item.type === 'date') {
        value = date.fromDateTime;
      }
      if (item.placeholder === 'endTime' && item.type === 'date') {
        value = date.toDateTime;
      }
      if (!value && !item?.required) {
        queryString = queryString.replace(r, '');
      } else if (value) {
        queryString = queryString.replace(r, `${value}`);
      }
    });

    queryString?.match(/[^=]\{\w+\}/g)?.forEach((r) => {
      const item: IRawQuerySourceDataPlaceholder = (dataItem.sourceData as IRawQuerySourceData).placeholders.find(
        (p) => p.placeholder === r.slice(2, -1),
      );
      let { value } = item;

      if (item.placeholder === 'startTime' && item.type === 'date') {
        value = date.fromDateTime;
      }
      if (item.placeholder === 'endTime' && item.type === 'date') {
        value = date.toDateTime;
      }
      if (!value && !item?.required) {
        queryString = queryString.replace(r, '');
      } else if (value) {
        queryString = queryString.replace(r, `${r.slice(0, 1) + r.slice(2, -1)}="${value}"`);
      }
    });

    queryString?.match(/=\{\w+\}/g)?.forEach((r) => {
      const item: IRawQuerySourceDataPlaceholder = (dataItem.sourceData as IRawQuerySourceData).placeholders.find(
        (p) => p.placeholder === r.slice(2, -1),
      );
      let { value } = item;

      if (item.placeholder === 'startTime' && item.type === 'date') {
        value = date.fromDateTime;
      }
      if (item.placeholder === 'endTime' && item.type === 'date') {
        value = date.toDateTime;
      }
      if (!value && !item?.required) {
        queryString = queryString.replace(r, '');
      } else if (value) {
        queryString = queryString.replace(r, `="${value}"`);
      }
    });

    if (chartType === ViewElementTypeEnum.CombChart) {
      this.activeShapesRawOldService.getRawDataCombChart(
        queryString,
        dataItem,
        chartId,
        view as IMultiLineChartOptions,
      );
    } else if (chartType === ViewElementTypeEnum.ComboChart) {
      this.getRawDataComboChart(queryString, dataItem, chartId, view as ITluiChartSingleLayerInputModel);
    } else if (chartType === ViewElementTypeEnum.PieChart) {
      this.getRawDataPieChart(queryString, dataItem, chartId);
    } else if (chartType === ViewElementTypeEnum.Table) {
      this.getRawDataTable(queryString, dataItem, chartId);
    }
  }

  public getHeaderData(requestOptions?: IMnemoChartRequestOptions | null): {
    fromDateTime: string;
    toDateTime: string;
  } {
    let date: IDatesInterval = this.dates$.getValue();

    if (requestOptions?.date?.start && requestOptions?.date?.end) {
      date = {
        fromDateTime: requestOptions.date.start,
        toDateTime: requestOptions.date.end,
      };
    }

    if (!date?.fromDateTime || !date?.toDateTime) {
      date = {
        fromDateTime: new Date(new Date().setHours(0, 0, 0)),
        toDateTime: new Date(new Date().setHours(23, 59, 59)),
      };
    }

    const fromDateDate = new Date(date.fromDateTime).toLocaleDateString('ru-RU').split('.').reverse().join('-');
    const fromDateTime = new Date(date.fromDateTime).toLocaleTimeString('ru-RU');
    const fromDate = `${fromDateDate} ${fromDateTime}`;

    const toDateDate = new Date(date.toDateTime).toLocaleDateString('ru-RU').split('.').reverse().join('-');
    const toDateTime = new Date(date.toDateTime).toLocaleTimeString('ru-RU');
    const toDate = `${toDateDate} ${toDateTime}`;

    return {
      fromDateTime: fromDate,
      toDateTime: toDate,
    };
  }

  private getRawDataTable(formula: string, tag: IDataMappingOptions, chartId: string): void {
    this.activeShapesService.isLoading$.next(true);
    this.activeShapesRealtimeService.orderMap.set(chartId, new Map());
    const orderMapRef = this.activeShapesRealtimeService.orderMap.get(chartId);
    this.rtdbFormulaApiService.getCalcByFormula<IDashboardRawData>(formula).subscribe({
      // IFormulaCalcRes?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (res: any) => {
        if (!res?.result) {
          this.activeShapesService.isLoading$.next(false);
          return;
        }

        res.result.forEach((r) => {
          const tableRowOrder = r.ResArray?.tableRowOrder;
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const key in tableRowOrder) {
            orderMapRef.set(key, tableRowOrder[key]);
          }

          this.activeShapesRealtimeService.rawDataMap.set(chartId, {
            name: formula,
            sourceType: null,
            sourceData: null,
            type: DataItemTypeEnum.Null,
            tableBody: r.ResArray?.value,
            parentChartId: chartId,
            palette: tag.palette,
          });
        });
        this.activeShapesRealtimeService.nextRealtimeData();
        this.activeShapesService.isLoading$.next(false);
      },
      error: (e) => {
        this.activeShapesService.isLoading$.next(false);
        this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.shared.error', e);
      },
    });
  }

  private getRawDataPieChart(formula: string, tag: IDataMappingOptions, chartId: string): void {
    this.activeShapesService.isLoading$.next(true);
    this.activeShapesRealtimeService.orderMap.set(chartId, new Map());
    const orderMapRef = this.activeShapesRealtimeService.orderMap.get(chartId);
    this.rtdbFormulaApiService.getCalcByFormula<IDashboardRawData>(formula).subscribe({
      // IFormulaCalcRes?
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (res: any) => {
        if (!res?.result) {
          this.activeShapesService.isLoading$.next(false);
          return;
        }
        res.result.forEach((r) => {
          // eslint-disable-next-line no-restricted-syntax, guard-for-in
          for (const key in r.ResArray) {
            if (r.ResArray[key]?.order) {
              orderMapRef.set(key, r.ResArray[key]?.order);
            }

            const pieData: TluiSectorData[] = r.ResArray[key]?.value
              ?.sort((a, b) => sortByOrderFunction(a, b))
              ?.map((v, i) => {
                let val = 0;
                let title: string | Date = '';
                // eslint-disable-next-line no-restricted-syntax
                for (const innerKey in v) {
                  if (innerKey === 'order') {
                    // eslint-disable-next-line no-continue
                    continue;
                  }
                  if (innerKey === 'val') {
                    val = v[innerKey];
                  } else {
                    title = v[innerKey];
                  }
                }

                return {
                  color: tag?.palette?.[i] ?? this.activeShapesService.getDefaultColor(i),
                  value: val.toFixed(2),
                  title:
                    Object.prototype.toString.call(title) === '[object Date]'
                      ? new Date(title).toLocaleDateString()
                      : title.toString(),
                };
              });
            this.activeShapesRealtimeService.rawDataMap.set(key + chartId, {
              name: key,
              sourceType: null,
              sourceData: null,
              type: DataItemTypeEnum.Null,
              chartData: pieData,
              parentChartId: chartId,
            });
          }
        });
        this.activeShapesRealtimeService.nextRealtimeData();
        this.activeShapesService.isLoading$.next(false);
      },
      error: (e) => {
        this.activeShapesService.isLoading$.next(false);
        this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.shared.error', e);
      },
    });
  }

  private getRawDataComboChart(
    formula: string,
    tag: IDataMappingOptions,
    chartId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    view: ITluiChartSingleLayerInputModel = null,
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
          this.parseLineBarChart(r, tag, chartId, null);
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

  private parseLineBarChart(
    r: IDashboardRawDataResult,
    tag: IDataMappingOptions,
    chartId: string,
    view: IMultiLineChartOptions = null,
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
        sourceData: null,
        type: tag.type,
        interpolation: tag.interpolation,
        chartData: data,
        parentChartId: chartId,
        color: tag?.palette?.[j - 1],
      });
      // eslint-disable-next-line no-plusplus
      j++;
    }
  }
}
