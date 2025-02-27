export interface IChartData {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  lineType?: LineType;
  color?: string;
  breakLine?: boolean;
  breakLineLimit?: number;
  interpolateEnable?: boolean;
}

export type ChartDataType = [number, number];

export type LineType =
  | 'curveBasis'
  | 'curveLinear'
  | 'curveMonotoneX'
  | 'curveMonotoneY'
  | 'curveNatural'
  | 'curveStep'
  | 'curveStepAfter'
  | 'curveStepBefore'
  | null;
