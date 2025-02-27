/* eslint-disable import/no-extraneous-dependencies */
import { ITluiChartSingleLayerInputModel, TluiChartLineDataSimple } from '@tl-platform/ui';
import { BehaviorSubject } from 'rxjs';
import { IFormulaData, IOmCellObject } from '../viewer';
import { IMnemoChartRequestOptions, IMnemoChartViewOptions } from './mnemo-chart.models';

export interface IMnemoChartSettingModel {
  chartOptions: ITluiChartSingleLayerInputModel;
  requestOptions?: IMnemoChartRequestOptions;
  viewOptions?: IMnemoChartViewOptions;
  requestSource?: IMnemoChartSourceForm;
}

export interface IMnemoChartTrendSettingModel {
  trendOptions: ITluiChartSingleLayerInputModel['lineLayer'];
  requestOptions?: IMnemoChartRequestOptions;
  viewOptions?: IMnemoChartViewOptions;
  trendName: string;
  isSeparateTrend?: boolean;
  chartData?: TluiChartLineDataSimple[];
}

export interface IMnemoChartRequestSettingModel {
  requestOptions?: IMnemoChartRequestOptions;
  viewOptions?: IMnemoChartViewOptions;
}

export interface IMnemoChartWrapperData {
  index: number;
  chartId: string;
  item: IMnemoChartPopupForm;
  itemChanged$: BehaviorSubject<IMnemoChartPopupForm>;
}

export interface IMnemoChartSourceForm {
  tagNamesString: string[];
  omAttrs: IOmCellObject[];
  formulas: IFormulaData[];
}

export interface IMnemoChartPopupForm {
  groupId: string;
  requestForm: IMnemoChartRequestOptions;
  sourceForm: IMnemoChartSourceForm;
  viewForm: IMnemoChartViewOptions;
}
