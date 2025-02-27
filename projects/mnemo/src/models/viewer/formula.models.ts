import { SourceType } from '../types';

export interface IFormulaData extends IFormulaDataBase {
  value?: unknown;
  sourceType?: SourceType;
}

export interface IFormulaDataBase {
  formula?: string;
  formulaAggregation?: string;
  formulaInterval?: number;
  formulaDimension?: string;
  formulaWeighting?: string;
  formulaMode?: string;
  unitName?: string;
  formulaValue?: string;
  formulaValid?: boolean;
}

export interface IFormulaReference {
  guid: number;
  shortName: string;
  name: string;
  cf?: number;
}

export interface IFormulaCalcRes {
  valid: boolean;
  formula: string;
  // result: {
  //   Err: string;
  //   ResArray: { [key: string]: { time: string, val: number }[] };
  //   Result: number;
  // }[];
  result: unknown;
}
