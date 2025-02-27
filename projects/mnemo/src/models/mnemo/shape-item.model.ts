import { DataItemTypeEnum, ShapeTypeEnum, ViewElementTypeEnum } from '../active-shapes';
import { IListTreeItem } from '../rtdb';

export interface IShapeItemGroup {
  name: string;
  shapes: IShapeItem[];
}

export interface IShapeItem {
  name: string;
  shape: string;
  cellType?: ShapeTypeEnum;
  viewElementType?: ViewElementTypeEnum;
  dataItemType?: DataItemTypeEnum;
  value?: string;
  pathToImg?: string;
  shapeMetaData?: IListTreeItem;
  width?: number;
  height?: number;
  isEdge?: boolean;
  showLabel?: boolean;
  tooltipLabel?: string;
  shapeFileId?: string;
  shapeElementId?: string;
  searchLabel?: string;
}
