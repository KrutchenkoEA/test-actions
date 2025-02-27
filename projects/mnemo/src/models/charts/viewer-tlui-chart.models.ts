/* eslint-disable import/no-extraneous-dependencies */
import {
  TluiLCAxisPosition,
  TluiLCAxisType,
  TluiLCDataPointType,
  TluiLCLineDynamics,
  TluiLCLineInputData,
  TluiLCLineInputDataIcon,
  TluiLCLineInputDataIconEnum,
  TluiLCTooltipMarkerType,
  TluiLCTooltipType,
  TluiLCZoomType,
} from '@tl-platform/ui';
import { SourceType } from '../types';

/** @deprecated */
export interface IViewerChartModels {
  chartId: string;
  viewOptions: IVCViewOpt;
  layers: IVCLayer[];
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCViewOpt {
  tooltip: boolean;
  tooltipType: TluiLCTooltipType;
  tooltipMarkerType: TluiLCTooltipMarkerType;
  tooltipMarkerCrossSize: number;
  tooltipColor: string;
  tooltipWidth: number;

  legend: boolean;

  zoomType: TluiLCZoomType;
  zoomXEnable: boolean;
  zoomYEnable: boolean;

  marginLeft: number;
  marginRight: number;
  marginBottom: number;
  marginTop: number;

  smartScrollEnable: boolean;
  smartScrollHeight: number;
  smartScrollColor: string;

  interpolateEnable: boolean;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLayer {
  layerTitle: SourceType | string;
  layerDrawOptions: {
    line: IVCLayerDataLine[];
    bar?: unknown[];
    stackBar?: unknown[];
  };
  layerViewOptions: IVCLayerViewOptions;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLayerViewOptions {
  axisX: {
    type: TluiLCAxisType;
    position: TluiLCAxisPosition;
    min: number;
    max: number;
    ticks: number;
    color: string;
    primary: boolean;
    textColor: string;
  };
  axisY: {
    type: TluiLCAxisType;
    position: TluiLCAxisPosition;
    min: number;
    max: number;
    ticks: number;
    color: string;
    primary: boolean;
    textColor: string;
  };
  gridX: {
    color: string;
  };
  gridY: {
    color: string;
  };
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLayerDataLine {
  layerDataDrawOptions: {
    data: TluiLCLineInputData[] | TluiLCLineInputDataIcon[] | TluiLCLineInputDataIconEnum[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataUpdate$: any;
  };
  layerDataViewOptions: IVCLayerDataLineViewOptions;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLayerDataLineViewOptions {
  lineDynamics: TluiLCLineDynamics;
  lineType: 'line' | 'area' | 'gradientArea';
  lineOpacity: number;
  lineWidth: number;

  dataPointType: 'all' | 'partial';
  dataPointColor: string;

  breakPointType: 'auto' | 'config';
  breakPoint: boolean;
  breakPointColor: string;
  breakPointSize: number;
  breakPointLimit: number;
  breakPointMarker: TluiLCDataPointType;

  endPoint: boolean;
  endPointSize: number;
  endPointStrokeSize: number;

  showValues: boolean;
  caption: string;
  engUnits: string;
  interpolateEnable: boolean;
  extendStep: number;

  reRangeThenLegendClick: boolean;
  reRangeThenDataChange: boolean;

  durationAnimation: number;
  animation: boolean;

  lineColor: string;
  areaColor: string;
  areaGradientColors: string;

  separateLayer: boolean;
}
