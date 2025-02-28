import { IActiveShapeTableCommonOptions, IActiveShapeTableRowOptions } from '../../../../models';

export const ACTIVE_SHAPES_TABLE_OPTIONS = 'active-shapes-table-options';

export const ACTIVE_SHAPES_TABLE_DEFAULT_VALUE: IActiveShapeTableCommonOptions = {
  isFilterEnable: false,
  isPaginatorEnable: false,
  isSortEnable: false,
};

export const ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE: IActiveShapeTableRowOptions = {
  fontSize: 12,
  fontWeight: 600,
  paddingVertical: 16,
  paddingHorizontal: 25,
  isBorderVerticalEnabled: false,
  isBorderHorizontalEnabled: true,
  borderVerticalWidth: 1,
  borderHorizontalWidth: 1,
  isBorderColor: false,
  textAlign: 'center',
};

export const ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE: IActiveShapeTableRowOptions = {
  fontSize: 11,
  fontWeight: 400,
  paddingVertical: 16,
  paddingHorizontal: 16,
  isBorderVerticalEnabled: false,
  isBorderHorizontalEnabled: true,
  borderVerticalWidth: 1,
  borderHorizontalWidth: 1,
  isBorderColor: false,
  textAlign: 'center',
  isColorRow: true,
};

export const ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE: Record<string, string> = {
  name: 'Имя',
  id: 'ID',
  sourceType: 'Источник',
  value: 'Значение',
  time: 'Время',
  color: 'Цвет',
};
