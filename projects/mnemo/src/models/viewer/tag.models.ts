export interface ITagsValues {
  id?: number;
  guid: number;
  time: Date | string;
  name?: string;
  val: number;
  status: number;
  withFormat?: boolean;
}

export interface ITagsMeta {
  guid: string;
  name: string;
  showInits?: boolean;
  unitName?: string;
}

export interface ITagHistoryData {
  id: number;
  guid: string;
  name: string;
  points?: ITagsValues[];
  withFormat?: boolean;
}

export interface IPoint {
  id?: number;
  time?: string | Date;
  name?: string;
  val?: number;
  status?: number;
  count?: number;
  comment?: string;
  hidden?: number;
  saveAt?: string | Date;
  preparedAt?: string | Date;
  withFormat?: boolean;
}

export interface ITagBase {
  tagName: string;
  timeStamp: Date | string | number;
  status: number;
}

export interface ITagName {
  tagName: string;
}

export interface IPostTag {
  id?: number;
  time?: string | Date;
  val?: string;
  status?: number;
  comment: string;
}

export interface IViewerTag {
  name: string;
  roundValue: boolean;
  isActiveShape?: boolean;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export interface ITagsWS {
  tagValues: ITagsValues[];
  isHistoricalDataSupported: boolean;
}

export interface IMnemoLite extends ITagsWS {
  element: {
    item: {
      mnemoGuid: string;
      widgetTitle: string;
    };
    name: string;
    templateName: string;
  };
  isHistoricalDataSupported: boolean;
}
