import { IFormulaData, IOmCellObject } from '../viewer';

/** @deprecated */
export interface IPopupForm {
  id: string;
  points: number;
  tags: string[];
  omAttrs: IOmCellObject[];
  formulas: IFormulaData[];
  date?: { start: Date; end: Date };
}
