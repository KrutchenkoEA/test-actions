/* eslint-disable import/no-extraneous-dependencies */
import { TluiChartLineDataSimple } from '@tl-platform/ui';
import { SourceType } from '../types';
import { IFormulaData, IOmCellObject } from '../viewer';

export interface ITagObjectChart {
  tagName: string;
  isActive: boolean;
  index: number;
}

export interface IOmObjectChart extends IOmCellObject {
  name: string;
  isActive: boolean;
  index: number;
}

export interface IFormulaObjectChart extends IFormulaData {
  isActive: boolean;
}

export interface IMnemoChartLineData {
  name: string;
  id: string;
  data: TluiChartLineDataSimple[];
  color: string;
}

export interface IMnemoChartLineDrawData {
  type: SourceType;
  data: IMnemoChartLineData[];
}
