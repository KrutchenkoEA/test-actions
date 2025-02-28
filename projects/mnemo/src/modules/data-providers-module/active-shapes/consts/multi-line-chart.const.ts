/* eslint-disable import/no-extraneous-dependencies */
import { TluiLCLineDynamics } from '@tl-platform/ui';
import { IMultiLineChartOptions } from '../../../../models';

export const ACTIVE_SHAPES_MULTI_LINE_CHART_OPTIONS = 'active-shapes-multi-line-chart-options';

export const INTERPOLATION_TYPES_OPTIONS: { name: string; value: TluiLCLineDynamics }[] = [
  { name: 'curveLinear', value: 'curveLinear' },
  { name: 'curveLinearClosed', value: 'curveLinearClosed' },
  { name: 'curveBasis', value: 'curveBasis' },
  { name: 'curveBasisOpen', value: 'curveBasisOpen' },
  { name: 'curveBasisClosed', value: 'curveBasisClosed' },
  { name: 'curveMonotoneX', value: 'curveMonotoneX' },
  { name: 'curveMonotoneY', value: 'curveMonotoneY' },
  { name: 'curveNatural', value: 'curveNatural' },
  { name: 'curveStep', value: 'curveStep' },
  { name: 'curveStepAfter', value: 'curveStepAfter' },
  { name: 'curveStepBefore', value: 'curveStepBefore' },
];

export const MOCK_1 = [
  [0, 20],
  [1, 10],
  [2, 110],
  [3, 280],
  [4, 302],
  [5, 110],
  [6, 480],
  [7, 95],
] as [number, number][];

export const MOCK_3 = [
  [0, 10],
  [1, 50],
  [2, 50],
  [3, 70],
  [4, 80],
  [5, 75],
  [6, 90],
  [7, 50],
] as [number, number][];

export const ACTIVE_SHAPES_MULTILINE_CHART_DEFAULT_VALUE: IMultiLineChartOptions = {
  isLegendEnabled: false,
  isTooltipEnabled: false,
  isSmartScrollEnabled: false,
  xLabelType: 'time',
  tooltipType: 'fullLine',
  //
  isBackgroundColorEnabled: false,
  isGridColorEnabled: false,
  isAxisesColorEnabled: false,
  isAxisValuesColorEnabled: false,
  //
  backgroundColor: 'transparent',
  gridColor: 'transparent',
  axisesColor: 'transparent',
  axisValuesColor: 'transparent',
  //
  reRangeEnable: true,
  zoomXEnable: true,
  zoomYEnable: false,
  zoomType: 'scroll',
  // bar chart
  isShowValue: false,
  valuePosition: 'center',
  isBarBorder: false,
  showNormalizeValue: false,
};
