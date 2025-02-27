import { SourceType } from '../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IOMAttribute {
  name: string;
  id: string;
  data: IOMAttributeData[];

  // модификация
  withFormat?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IOMAttributeData {
  attributeId: string;
  name: string;
  realName: string;
  description: string;
  values: IOMAttributeValues[];
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IOMAttributeValues {
  value: string | number;
  valueType: string;
  timeStamp: string;
  isGood: boolean;

  // модификация
  attributeId?: string;
  withFormat?: boolean;
  unitName?: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IOMAttributeAll {
  attributes: {
    id: string;
    name: string;
    realName: string;
    description: string;
    value: IOMAttributeValues;
    unitsOfMeasure?: string;
  }[];
  name: string;
  id: string;
  templateId: string;
  templateName: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface IOmCellObject extends IOmCellObjectBase {
  value?: string | number | boolean;
  sourceType?: SourceType;
}

export interface IOmCellObjectBase {
  attrGuid: string;
  attrName: string;
  attrType: number;
  attrParentPath: string;
  attrParentGuid: string;
}

export type OmMapType = 'default' | 'rounded' | 'active-shapes';
