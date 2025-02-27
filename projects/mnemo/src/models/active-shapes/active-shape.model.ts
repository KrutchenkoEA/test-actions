/* eslint-disable import/no-extraneous-dependencies */
import { Type } from '@angular/core';
import { DataItemTypeEnum, ViewElementTypeEnum } from './shape.enum';

export interface IActiveShapesElement {
  name: string;
  type: ViewElementTypeEnum;
  dataItemType?: DataItemTypeEnum;
  component: Type<unknown>;
  icon?: string;
  optionsComponent?: Type<unknown>;
  isMnemoItem?: boolean;
  isDashboardItem?: boolean;
}
