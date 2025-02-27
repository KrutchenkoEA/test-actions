/* eslint-disable import/no-cycle */
/* eslint-disable import/no-extraneous-dependencies */
import { ITluiChartSingleLayerInputModel } from '@tl-platform/ui';
import { IDataMappingOptionsViewer } from './dashboard-mapping-options.model';

export interface IComboChartRenderingOptions {
  view: ITluiChartSingleLayerInputModel;
  data: IDataMappingOptionsViewer[];
  comboData: IComboChartComboData;
}

export interface IComboChartComboData {
  comboBar: IDataMappingOptionsViewer;
  comboBarHorizontal: IDataMappingOptionsViewer;
  stackBar: IDataMappingOptionsViewer;
  stackBarHorizontal: IDataMappingOptionsViewer;
  /** @deprecated tlui-layer-chart */
  fullStackBar: IDataMappingOptionsViewer;
}

export type ComboChartComboKeyType =
  | 'comboBar'
  | 'comboBarHorizontal'
  | 'stackBar'
  | 'stackBarHorizontal'
  /** @deprecated tlui-layer-chart */
  | 'fullStackBar';
