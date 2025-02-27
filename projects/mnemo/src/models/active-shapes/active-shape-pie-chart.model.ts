/* eslint-disable import/no-cycle */
/* eslint-disable import/no-extraneous-dependencies */
import { FormGroup } from '@angular/forms';
import { TluiSectorData } from '@tl-platform/ui';
import { IDataMappingOptions } from './dashboard-mapping-options.model';
import { DashboardSourceDataType } from './dashboard-source-type';
import { ToFormControlType } from '../types';

export interface IPieChartOptions {
  fitToWidget: boolean;
  outerRadius: number;
  innerRadius: number;
  sectorsGap: number;
  isLegendEnabled: boolean;
  isDisplayValueEnabled: boolean;
  containerPosition: 'top' | 'center' | 'bottom';
  animation: 'radialExpansion' | 'scale' | 'none';
  durationAnimationMs: number;
}

export interface IPieChartRenderingOptions {
  view: IPieChartOptions;
  data: IDataMappingOptions;
}

export interface IPieChartData extends TluiSectorData {
  sourceType: DashboardSourceDataType;
  attrGuid?: string;
}

export type PieChartFormType = FormGroup<ToFormControlType<IPieChartOptions>>;
