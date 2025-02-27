/* eslint-disable import/no-extraneous-dependencies */
import { IMnemoChartRequestOptions } from '../../models';

export const MNEMO_CHART_DEFAULT_REQUEST_OPTIONS: IMnemoChartRequestOptions = {
  points: 0,
  date: null,
  hoursPeriod: 8,
  realtimeRefresh: true,
  fixedPoints: true,
  scale: false,
  intervalsCount: 200,
};

export const MNEMO_CHART_DEFAULT_REQUEST_OPTIONS_EMPTY: IMnemoChartRequestOptions = {
  points: null,
  date: null,
  hoursPeriod: null,
  realtimeRefresh: null,
  fixedPoints: null,
  scale: null,
  intervalsCount: null,
};

export const GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS = (
  updateEnabled: boolean = MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.realtimeRefresh,
  scaleEnabled: boolean = MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.scale,
  dateEnabled: boolean = true
): IMnemoChartRequestOptions => {
  return {
    date: dateEnabled
      ? {
          start: new Date(new Date().setHours(new Date().getHours() - MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod)),
          end: new Date(),
        }
      : null,
    points: MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.points,
    hoursPeriod: MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod,
    realtimeRefresh: updateEnabled,
    fixedPoints: MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.fixedPoints,
    scale: scaleEnabled,
    intervalsCount: MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.intervalsCount,
  };
};
