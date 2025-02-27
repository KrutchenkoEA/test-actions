/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TluiLCLineDynamics } from '@tl-platform/ui';
import { IFormulaDataBase, IOmCellObjectBase, ITagName } from '../viewer';
import { IRawQuerySourceData } from './dashboard-raw.models';
import { DashboardSourceDataType } from './dashboard-source-type';
import {
  IActiveShapeRawRowTableType,
  IActiveShapeTableDataDefault,
  IDashboardTableChartData,
} from './active-shape-table.model';
import { DataItemTypeEnum, ViewElementTypeEnum } from './shape.enum';
import { ISourceModalResult } from '../rtdb';

export interface IDataMappingOptions
  extends IDataMappingOptionsForm,
    IDataMappingOptionsStackChartOptions,
    IDataMappingOptionsViewerRaw {
}

export interface IDataMappingOptionsForm
  extends IDataMappingOptionsLayerChartOptions,
    IDataMappingOptionsBarChartOptions {
  name: string;
  type: DataItemTypeEnum;
  sourceData: Partial<IOmCellObjectBase> &
    Partial<ITagName> &
    Partial<{ tagName: string; tagId: number }> &
    Partial<IRawQuerySourceData> &
    Partial<IFormulaDataBase>;
  sourceType: DashboardSourceDataType;
  color?: string;
  palette?: string[];
  opacity?: number;
  chartData?: any;
}

export interface IDataMappingOptionsViewer
  extends IDataMappingOptions,
    IDataMappingOptionsViewerRaw,
    IDataMappingOptionsTable {
  barBorderColors?: string[];
  parentChartId?: string; // Фильтрация по realTimeData$
  parentViewElementType?: ViewElementTypeEnum; // Viewer
  dataNameTypeRecord?: Record<string, DashboardSourceDataType>;
  dataNameGuidRecord?: Record<string, string>;
}

export interface IDataMappingOptionsViewerRaw {
  chartDataRaw?: any[];
  barBorderColorsRaw?: string[];
  opacityArrRaw?: number[];
  captionRaw?: string[];
  paletteRaw?: string[];

  chartDataCommon?: any[];
  barBorderColorsCommon?: string[];
  opacityArrCommon?: number[];
  captionCommon?: string[];
  paletteCommon?: string[];
}

export interface IDataMappingOptionsTable {
  tableBody?: (IActiveShapeTableDataDefault | IActiveShapeRawRowTableType)[];
  tableData?: IDashboardTableChartData;
}

export interface IDataMappingOptionsLayerChartOptions {
  interpolation?: TluiLCLineDynamics; // для Line, Area, GradientArea
}

export interface IDataMappingOptionsBarChartOptions {
  secondColor?: string;
}

export interface IDataMappingOptionsStackChartOptions {
  caption?: string[]; // StackBar, FullStackBar
  opacityArr?: number[];
}

export interface IDataMappingTabsSourceEvent {
  sourceType: DashboardSourceDataType;
  sql?: any;
  raw?: IRawQuerySourceData;
  tags?: ISourceModalResult['tags'];
  attributes?: ISourceModalResult['attributes'];
}
