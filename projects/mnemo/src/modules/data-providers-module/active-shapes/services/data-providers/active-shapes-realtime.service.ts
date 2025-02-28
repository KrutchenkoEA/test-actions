/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { TluiChartLineDataSimple } from '@tl-platform/ui';
import { BehaviorSubject } from 'rxjs';
import { IDashboardRealTimeData, IDataMappingOptionsViewer } from '../../../../../models';

@Injectable()
export class ActiveShapesRealtimeService {
  public tagNameDataMap: Map<string, TluiChartLineDataSimple[]> = new Map<string, TluiChartLineDataSimple[]>();
  public omAttrDataMap: Map<string, TluiChartLineDataSimple[]> = new Map<string, TluiChartLineDataSimple[]>();
  public formulaMap: Map<string, IDataMappingOptionsViewer> = new Map<string, IDataMappingOptionsViewer>();
  public rawDataMap: Map<string, IDataMappingOptionsViewer> = new Map<string, IDataMappingOptionsViewer>();
  public orderMap: Map<string, Map<string, number>> = new Map<string, Map<string, number>>();

  public realTimeData$: BehaviorSubject<IDashboardRealTimeData> = new BehaviorSubject<IDashboardRealTimeData>({
    omAttr: new Map(),
    tag: new Map(),
    raw: new Map(),
    orderMap: new Map<string, Map<string, number>>(),
  });

  public fixedPointsRealtimeValuesMap$: BehaviorSubject<Map<string, boolean>> = new BehaviorSubject<
    Map<string, boolean>
  >(new Map<string, boolean>());

  public pointsRealtimeValuesMap$: BehaviorSubject<Map<string, number>> = new BehaviorSubject<Map<string, number>>(
    new Map<string, number>(),
  );

  public nextRealtimeData(): void {
    this.realTimeData$.next({
      omAttr: this.omAttrDataMap,
      tag: this.tagNameDataMap,
      raw: this.rawDataMap,
      orderMap: this.orderMap,
      formulaMap: this.formulaMap,
    });
  }

  public cleanData(): void {
    this.omAttrDataMap.clear();
    this.tagNameDataMap.clear();
    this.rawDataMap.clear();
    this.orderMap.clear();
    this.formulaMap.clear();
  }
}
