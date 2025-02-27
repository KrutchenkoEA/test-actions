/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { ITluiChartSingleLayerInputModel, TluiChartLineDataSimple } from '@tl-platform/ui';
import { GridsterItem } from 'angular-gridster2';
import { IMultiLineChartOptions } from './active-shape-multi-line-chart.model';
import { IPieChartOptions } from './active-shape-pie-chart.model';
import { IActiveShapeTableOptions } from './active-shape-table.model';
import { IMnemoChartRequestOptions, IMnemoChartViewOptions } from '../charts';
import { IDataMappingOptions, IDataMappingOptionsViewer } from './dashboard-mapping-options.model';
import { ViewElementTypeEnum } from './shape.enum';

export interface IDashboardItem extends GridsterItem {
  id: string;
  name: string;
  viewElementType: ViewElementTypeEnum;
  options?: IDashboardItemOptions;
  requestOptions?: IMnemoChartRequestOptions;
  viewOptions?: IMnemoChartViewOptions;
}

export interface IDashboardItemOptions {
  exampleView: boolean;
  type: ViewElementTypeEnum;
  view: IMultiLineChartOptions | IPieChartOptions | IActiveShapeTableOptions | ITluiChartSingleLayerInputModel;
  data: IDataMappingOptions[];
  defaultData?: unknown;
}

export interface IDashboardRealTimeData {
  omAttr: Map<string, TluiChartLineDataSimple[]> | null;
  tag: Map<string, TluiChartLineDataSimple[]> | null;
  raw: Map<string, IDataMappingOptionsViewer> | null;
  orderMap: Map<string, Map<string, number>> | null;
  formulaMap?: Map<string, IDataMappingOptionsViewer> | null;
}
