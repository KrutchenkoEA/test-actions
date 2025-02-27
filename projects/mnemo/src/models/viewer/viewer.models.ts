import { SourceTypeBase } from '../types';

export interface IMnemoEvent {
  id: number | string;
  timestamp: string | Date;
  name: string;
  value: number | string;
  status: string;
  sourceType: SourceTypeBase;
}
