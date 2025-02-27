/* eslint-disable import/no-extraneous-dependencies */
import { IMnemoChartViewOptions } from '../../models';

export const MNEMO_CHART_DEFAULT_VIEW_OPTIONS: IMnemoChartViewOptions = {
  maxSelectedTrend: 15,
  autoZoom: false,
  autoZoomAxisActiveState: null,
  exponent: 1,
};

export const MNEMO_CHART_DEFAULT_VIEW_OPTIONS_EMPTY: IMnemoChartViewOptions = {
  autoZoom: null,
  autoZoomAxisActiveState: null,
  exponent: null,
};

export const GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS = (): IMnemoChartViewOptions => {
  return {
    maxSelectedTrend: MNEMO_CHART_DEFAULT_VIEW_OPTIONS.maxSelectedTrend,
    autoZoom: MNEMO_CHART_DEFAULT_VIEW_OPTIONS.autoZoom,
    autoZoomAxisActiveState: MNEMO_CHART_DEFAULT_VIEW_OPTIONS.autoZoomAxisActiveState,
    exponent: MNEMO_CHART_DEFAULT_VIEW_OPTIONS.exponent,
  };
};
