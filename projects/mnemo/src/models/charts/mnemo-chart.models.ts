/* eslint-disable import/no-extraneous-dependencies */
import { ITluiChartSingleLayerInputModel, TluiChartLineDataSimple } from '@tl-platform/ui';
import { BehaviorSubject } from 'rxjs';
import { IFormulaObjectChart, IOmObjectChart, ITagObjectChart } from './mnemo-chart-data.models';

export interface IMnemoChartRequestOptions {
  realtimeRefresh?: boolean;
  fixedPoints?: boolean;
  points?: number;
  date?: IMnemoChartDateOptions;
  hoursPeriod?: number;
  scale?: boolean;
  intervalsCount?: number;
}

export interface IMnemoChartViewOptions {
  maxSelectedTrend?: number;
  autoZoom?: boolean;
  autoZoomAxisActiveState?: Record<string, boolean>;
  exponent?: number;
}

export interface IMnemoChartDataOptions extends IMnemoChartRequestOptions, IMnemoChartViewOptions {
  tags?: ITagObjectChart[];
  tagNamesString?: string[];
  omAttributes?: IOmObjectChart[];
  formulas?: IFormulaObjectChart[];
}

export interface IMnemoChartDrawData {
  view: ITluiChartSingleLayerInputModel;
  data: IMnemoChartObject[];
  additionalLayers?: {
    view: ITluiChartSingleLayerInputModel;
    data: IMnemoChartObject[];
  }[];
}

export interface IMnemoChartObject {
  name: string;
  color?: string;
  opacity?: number;
  dataUpdate$: BehaviorSubject<TluiChartLineDataSimple[]>;
  customView?: ITluiChartSingleLayerInputModel['lineLayer'];
  isAxisVisible?: boolean;
}

export interface IMnemoCharDataForSave {
  name: string;
  date: IMnemoChartDateOptions;
  points: number;
  data: TluiChartLineDataSimple[];
}

export interface IMnemoChartDateOptions {
  start: Date | null;
  end: Date | null;
}
