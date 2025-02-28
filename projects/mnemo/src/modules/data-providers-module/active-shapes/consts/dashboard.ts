import { DashboardSourceDataType } from '../../../../models';

export const DATA_SOURCE_TABS: { type: DashboardSourceDataType; name: string }[] = [
  { name: 'SQL запрос', type: 'sql' },
  { name: 'RAW запрос', type: 'raw' },
  { name: 'Теги', type: 'tag' },
  { name: 'Атрибуты Ом', type: 'omAttr' },
];

export const ACTIVE_SHAPES_DATA_MAPPING_OPTIONS = 'active-shapes-data-mapping-options';
export const ACTIVE_SHAPES_DATA_MAPPING_REQUEST_OPTIONS = 'active-shapes-data-mapping-request-options';
export const ACTIVE_SHAPES_DATA_MAPPING_VIEW_OPTIONS = 'active-shapes-data-mapping-view-options';
