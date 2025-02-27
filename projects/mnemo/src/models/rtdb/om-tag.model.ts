import { DataType } from './data-types.model';
import { IObjectAttribute } from './om-tag-object.model';
import { ObjectEntityTypeEnum } from '../rtdb';

export type MethodType = 'objectModel' | 'tag';

export interface IResponseTreeItem {
  guid: string;
  name: string;
  description: string;
  templateId: string;
  templateName: string;
  children?: IResponseTreeItem[];
  system?: boolean;
  entityType?: ObjectEntityTypeEnum;
  // Добавляется для модификации (не приходит с бека)
  path?: string;
}

export interface IListTreeItem {
  value?: IResponseTreeItem;
  label?: string;
  isFirstLevel?: boolean;
  expanded?: boolean;
  isSelected?: boolean;
  isCheckboxSelected?: boolean;
  id: string;
  modelParentGuid?: string;
  children?: IListTreeItem[];
}

export interface IOmTagModalInputConfig {
  baseUrl: string;
  multipleSelect: boolean;
  multipleSelectObject: boolean;
  allowMethods: MethodType[];
  selectedPathArray?: string[];
  enablePropTable?: boolean;
  currentMethod?: MethodType;
  filterAttributeType: DataType | null;
  cacheTree: boolean;
  cacheAttributes: boolean;
}

export interface ISourceModalResult {
  multiple?: boolean;
  // checkbox
  objectsPathArr?: string[];
  tagsFromObjects?: IObjectAttribute[];

  // tags
  tags?: { tagName: string; parentGuid?: string; parentPath?: string }[];
  // attributes
  attributes?: {
    attrName: string;
    attrGuid: string;
    attrParentGuid: string;
    attrParentPath: string;
    attrType: number;
  }[];

  // не используются
  constants?: { name: string; guid: string }[];
  formulas?: { name: string; guid: string }[];
  SQLs?: { name: string; guid: string }[];
  urls?: { name: string; guid: string }[];
}
