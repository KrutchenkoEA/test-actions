/* eslint-disable import/no-extraneous-dependencies */
import { TluiLCTooltipMarkerType, TluiLCTooltipType, TluiLCZoomType } from '@tl-platform/ui';
import { LineType } from './chart.models';

/** @deprecated */
export interface IChartOptions {
  width: number;
  height: number;
  chartName: ChartNameType;
}

/** @deprecated */
export type SelectedTagType = string[] | null;
/** @deprecated */
export type ChartNameType = 'chartTags1$' | 'chartTags2$' | 'chartTags3$';
/** @deprecated */
export type LineTypesType = 'lineType1$' | 'lineType2$' | 'lineType3$';

/** @deprecated */
export interface IChartDrawOpt {
  lineType: LineType;

  zoomXEnable: boolean;
  zoomYEnable: boolean;
  zoomType: TluiLCZoomType;

  smartScrollEnable: boolean;
  interpolateEnable: boolean;

  tooltipType: TluiLCTooltipType;
  markerType: TluiLCTooltipMarkerType;
}
