/** @deprecated */
export interface IScrollChange {
  start: number;
  widthPercent: number;
}

/** @deprecated */
export type ScrollDataType = [Date | number, number][];

export interface ITimeSelect {
  periodFrom?: Date;
  periodTo?: Date;
  periodFromIndex?: null | number;
  periodToIndex?: null | number;

  periodArr?: Date[];
  currentIndex: number;
  current?: number;

  downloadedFromIndex?: null | number;
  downloadedToIndex?: null | number;

  bufferStep?: number;
  bufferFromIndex?: null | number;
  bufferToIndex?: null | number;

  isBufferDownloaded?: boolean;
  timeTicks?: Date[];
}

export type PlayerButtonType =
  | 'reset'
  | 'backPeriod'
  | 'back'
  | 'forward'
  | 'forwardPeriod'
  | 'loop'
  | 'startPause'
  | 'acceleration';
