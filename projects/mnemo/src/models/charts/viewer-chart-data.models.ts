/* eslint-disable import/no-extraneous-dependencies */
import { TluiLCLineInputData } from '@tl-platform/ui';
import { SourceType } from '../types';
import { IFormulaObjectChart, IOmObjectChart, ITagObjectChart } from './mnemo-chart-data.models';

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCDataOptions extends IVCLineOpt {
  tags?: ITagObjectChart[];
  tag?: ITagObjectChart;
  tagNamesString?: string[];

  omAttributes?: IOmObjectChart[];
  omAttribute?: IOmObjectChart;

  formulas?: IFormulaObjectChart[];
  formula?: IFormulaObjectChart;

  isExistData?: boolean;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCDrawData {
  type: SourceType;
  data: IVCLineData[];
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLineData {
  name: string;
  id: string;
  data: TluiLCLineInputData[];
  color: string;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCSettingsPopup extends IVCLineOpt {
  sourceType: SourceType;
  name?: string;
  data: TluiLCLineInputData[];
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLineOpt {
  date?: IDateOptions;
  pointsCount?: number;
  exponent?: number;
}

/** @deprecated */
// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IVCLineSaveData {
  name: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  pointsCount: number;
  data: TluiLCLineInputData[];
}

/** @deprecated */
export interface IDateOptions {
  start: Date | null;
  end: Date | null;
}
