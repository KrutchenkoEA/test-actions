/* eslint-disable import/no-cycle */
/* eslint-disable import/no-extraneous-dependencies */
import { FormControl, FormGroup } from '@angular/forms';
import { IDataMappingOptionsViewer } from './dashboard-mapping-options.model';
import { ToFormControlType } from '../types';

export interface IActiveShapeTableOptions {
  table: IActiveShapeTableCommonOptions;
  header: IActiveShapeTableRowOptions;
  body: IActiveShapeTableRowOptions;
  keyName: Record<string, string>;
  keyNameCustom?: Record<string, string>;
}

export interface IActiveShapeTableCommonOptions {
  isFilterEnable: boolean;
  isPaginatorEnable: boolean;
  isSortEnable: boolean;
}

export interface IActiveShapeTableRowOptions {
  fontSize: number;
  fontWeight: number;
  paddingVertical: number;
  paddingHorizontal: number;
  isBorderVerticalEnabled: boolean;
  isBorderHorizontalEnabled: boolean;
  borderVerticalWidth: number;
  borderHorizontalWidth: number;
  isBorderColor: boolean;
  textAlign: 'start' | 'center' | 'end';
  isColorRow?: boolean;
}

export interface IActiveShapeTableRenderingOptions {
  view: IActiveShapeTableOptions;
  data: IDataMappingOptionsViewer;
  rawData: IDataMappingOptionsViewer[];
}

export interface IDashboardTableChartData {
  displayedColumns: string[];
  data: IActiveShapeRawRowTableType[];
  footerEnable?: boolean;
}

export interface IActiveShapeTableDataDefault {
  color: string;
  name: string;
  id?: string | number;
  sourceType: string;
  value: string | number;
  time: string;
}

export interface IActiveShapeRawRowTableType {
  [key: string]: string;
}

export type TableChartFormType = FormGroup<{
  table: FormGroup<ToFormControlType<IActiveShapeTableCommonOptions>>;
  header: FormGroup<ToFormControlType<IActiveShapeTableRowOptions>>;
  body: FormGroup<ToFormControlType<IActiveShapeTableRowOptions>>;
  keyName: FormGroup<ToFormControlType<Record<string, string>>>;
  keyNameCustom: FormGroup<ToFormControlType<Record<string, string>>>;
  keyForm: FormControl;
  nameForm: FormControl;
}>;
