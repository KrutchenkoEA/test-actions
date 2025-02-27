import {
  ActiveElementTypeEnum,
  DataItemTypeEnum,
  IDashboardItem,
  ShapeTypeEnum,
  ViewElementTypeEnum,
} from '../active-shapes';
import { SourceType } from '../types';

export interface ICellBuilder {
  sourceType: SourceType;
  tagRules: string;
  url: string;

  loadEvents: boolean | 1 | 0;
  disableValue: boolean | 1 | 0;
  roundValue: boolean | 1 | 0;
  showUnits: boolean | 1 | 0;
  showWarning: boolean | 1 | 0;

  cellType: ShapeTypeEnum;
  activeElementImageStyle: ActiveElementTypeEnum;
  defaultStyle?: string;
  viewElementType?: ViewElementTypeEnum;
  dataItemType?: DataItemTypeEnum;
  activeShape?: IDashboardItem;
  isManualTag?: boolean;
}

export interface ICellViewer {
  blink: boolean | number;
  invisible: boolean | number;
  visible: boolean | number;
  hiddenValue: boolean | number | string;
  tagDefStyle: Record<string, string>;
}

export interface ICellPortModel {
  in: { id: string; name: string }[];
  out: { id: string; name: string }[];
  nonDirectional: { id: string; name: string }[];
}
