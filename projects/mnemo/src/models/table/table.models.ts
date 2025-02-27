import { SourceType } from '../types';

/** @deprecated */
export interface ITableStructure {
  name: string;
  autofilter: unknown;
  cols: {
    len: number;
    [key: number]: {
      width?: number;
    };
  };
  rows: {
    len: number;
    [key: number]: {
      height?: number;
      cells: {
        [key: number]: ITableParams;
      };
    };
  };
  merges: string[];
  styles: IStyleObject[];
  validations: unknown[];
}

/** @deprecated */
export type BorderType = 'thin' | 'medium' | 'thick' | 'dotted' | 'dashed';

/** @deprecated */
export interface IStyleObject {
  // text
  font?: {
    size?: number;
    name?: string;
    italic?: boolean;
    bold?: boolean;
  };
  underline?: boolean;
  strike?: boolean;
  textwrap?: boolean;

  // color, bg, border
  color?: string;
  bgcolor?: string;
  border?: {
    top?: [BorderType, string];
    right?: [BorderType, string];
    bottom?: [BorderType, string];
    left?: [BorderType, string];
  };

  // align
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
}

/** @deprecated */
export interface ICssStyleObject {
  // text
  'font-size'?: string;
  'font-family'?: string;
  'font-style'?: string;
  'font-weight'?: string;
  'text-decoration'?: string;
  'white-space'?: 'pre-wrap' | 'nowrap';

  // color, bg, border
  color?: string;
  background?: string;
  'background-color'?: string;
  'border-top'?: string;
  'border-right'?: string;
  'border-bottom'?: string;
  'border-left'?: string;

  // align
  'align-items'?: 'start' | 'center' | 'end' | undefined;
  'justify-content'?: 'start' | 'center' | 'end' | undefined;
}

/** @deprecated */
export interface ICellObject {
  sourceType?: SourceType;
  tagDefStyle?: object;
  text: string;
  style?: number;
  tagName?: string;
  url?: string;
  tagRules?: string;
  loadEvents?: string;
  disableValue?: string;
  roundValue?: boolean;
  showUnits?: boolean;
  showWarning?: boolean;

  attrName: string;
  attrGuid: string;
  attrParentGuid: string;
  attrParentPath: string;

  formula: string;
  formulaAggregation: string | null;
  formulaInterval: number;
  formulaDimension: string | null;
  formulaWeighting: string | null;
  formulaMode: string | null;
  unitName?: string;
  formulaValue: unknown;
  formulaValid: boolean;
}

/** @deprecated */
export interface ITableParams extends ICellObject {
  tagType?: TagType | string;
  ri?: number;
  ci?: number;
  A1Tag?: string;
  val?: number | string;
  tagId?: number | string;
  tagGuid?: number | string;
  status?: number;
  timeStamp?: Date;
  time?: Date | string;
  hiddenValue?: string;
  manualTagValue?: number;
  manualTagDate?: Date;
  manualTagComment?: string;
  invisible?: boolean;
  blink?: boolean;
  unitName?: string;
}

/** @deprecated */
export type TagType = 'TLTAG' | 'TLMANUALTAG' | 'DEFAULT';
