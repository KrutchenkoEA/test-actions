/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { FormGroup } from '@angular/forms';
import { TluiLCZoomType } from '@tl-platform/ui';
import { IDataMappingOptionsViewer } from './dashboard-mapping-options.model';
import { ToFormControlType } from '../types';

/** @deprecated tlui-layer-chart */
export interface IMultiLineChartOptions {
  isLegendEnabled: boolean;
  isTooltipEnabled: boolean;
  isSmartScrollEnabled: boolean;
  xLabelType: 'time' | 'number' | 'enum';
  tooltipType: 'dataPoint' | 'fullLine';
  //
  isBackgroundColorEnabled: boolean;
  isGridColorEnabled: boolean;
  isAxisesColorEnabled: boolean;
  isAxisValuesColorEnabled: boolean;
  //
  backgroundColor: string;
  gridColor: string;
  axisesColor: string;
  axisValuesColor: string;
  //
  reRangeEnable: boolean;
  zoomXEnable: boolean;
  zoomYEnable: boolean;
  zoomType: TluiLCZoomType;
  // bar chart
  isShowValue: boolean;
  valuePosition: 'top' | 'center' | 'bottom';
  isBarBorder: boolean;
  showNormalizeValue: boolean;
}

/** @deprecated tlui-layer-chart */
export interface IMultiLineChartRenderingOptions {
  view: IMultiLineChartOptions;
  data: IDataMappingOptionsViewer[];
  comboData: {
    stackBar: IDataMappingOptionsViewer;
    fullStackBar: IDataMappingOptionsViewer;
  };
}

/** @deprecated tlui-layer-chart */
export type MultiLineChartFormType = FormGroup<ToFormControlType<IMultiLineChartOptions>>;
