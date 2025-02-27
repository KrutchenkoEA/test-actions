import {
  ChartColorService,
  ChartOptionsService,
  ChartPageFormulaService,
  ChartPageOmService,
  ChartPageTagsService,
  ChartService,
  ChartWrapService,
  PopupChartService,
} from './services';

/**  @deprecated use MnemoChartModule */
export const ChartProviders = [
  PopupChartService,
  ChartService,
  ChartColorService,
  ChartPageTagsService,
  ChartPageOmService,
  ChartPageFormulaService,
  ChartWrapService,
  ChartOptionsService,
];
