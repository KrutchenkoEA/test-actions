export interface IDashboardRawData {
  formula: string;
  result: IDashboardRawDataResult[];
  valid: boolean;
}

export interface IDashboardRawDataResult {
  Err: string;
  ResArray: {
    [key: string]: {
      value: { time?: string; val?: number; order?: number; name?: string }[];
      order?: number;
    };
  };
  Result: unknown;
}

export interface IDashboardRawDataTable {
  formula: string;
  result: IDashboardRawDataTableResult[];
  valid: boolean;
}

export interface IDashboardRawDataTableResult {
  Err: string;
  ResArray: {
    tableRowOrder?: { [key: string]: number };
    value: { [key: string]: unknown }[];
  };
  Result: unknown;
}
