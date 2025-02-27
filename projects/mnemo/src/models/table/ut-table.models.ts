/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { ICellBuilder, ICellViewer } from '../mnemo';
import { IFormulaDataBase, IOmCellObjectBase, ITagBase } from '../viewer';

type Nullable<T> = void | null | undefined | T; // import { Nullable } from '@univerjs/core';
type CellValue = string | number | boolean; // import { CellValue } from '@univerjs/core';
enum CellValueType {
  STRING = 1,
  NUMBER = 2,
  BOOLEAN = 3,
  FORCE_STRING = 4,
} // import { CellValueType } from '@univerjs/core';
interface ICellData {
  // import { ICellData } from '@univerjs/core';
  p?: any;
  s?: any;
  v?: Nullable<CellValue>;
  t?: Nullable<CellValueType>;
  f?: Nullable<string>;
  si?: Nullable<string>;
  custom?: Nullable<Record<string, any>>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IUTTableCellData extends ICellData {
  custom?: IUTTableCellDataCustom;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IUTTableCellDataCustom
  extends Partial<ICellBuilder>,
    Partial<IOmCellObjectBase>,
    Partial<ITagBase>,
    Partial<IFormulaDataBase>,
    Partial<ICellViewer> {
  ri: number;
  ci: number;
  id: string;
}
