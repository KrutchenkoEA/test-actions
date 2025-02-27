import { SourceTypeBase } from '../types';

export type DashboardSourceDataType = SourceTypeBase | DashboardSourceBaseType | DashboardSourceViewerType;
type DashboardSourceBaseType = 'sql' | 'raw' | '';
type DashboardSourceViewerType = 'rawNested' | 'сomboChart' | 'stackChart'; // используются только во вьювере
