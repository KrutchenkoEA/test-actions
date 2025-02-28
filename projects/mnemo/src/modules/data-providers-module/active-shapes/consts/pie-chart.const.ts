/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
import { IDataMappingOptionsViewer, IPieChartData, IPieChartOptions } from '../../../../models';

export const ACTIVE_SHAPES_PIE_CHART_OPTIONS = 'active-shapes-pie-chart-options';

export const ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE: IPieChartOptions = {
  fitToWidget: true,
  outerRadius: 200,
  innerRadius: 0,
  sectorsGap: 0,
  isLegendEnabled: true,
  isDisplayValueEnabled: true,
  containerPosition: 'center',
  animation: 'radialExpansion',
  durationAnimationMs: 1000,
};

export const ACTIVE_SHAPES_PIE_MOCK: IDataMappingOptionsViewer = {
  chartData: [
    {
      color: 'var(--color-index-deviation)',
      value: 10,
      title: '3',
    },
    {
      color: 'var(--color-index-critical)',
      value: 10,
      title: '2',
    },
    {
      color: 'var(--color-logo)',
      value: 10,
      title: '1',
    },
  ],
  name: '',
  parentChartId: '',
  sourceData: undefined,
  sourceType: '',
  type: null,
};

export const ACTIVE_SHAPES_PIE_CHART_DATA: IPieChartData[] = [
  {
    color: 'var(--color-logo)',
    value: 10,
    title: 'raw...1',
    sourceType: 'raw',
  },
  {
    color: 'var(--color-index-plan)',
    value: 10,
    title: 'raw...2',
    sourceType: 'raw',
  },
  {
    color: 'var(--color-index-green)',
    value: 10,
    title: 'raw...n',
    sourceType: 'raw',
  },
];
