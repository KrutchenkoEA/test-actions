export interface IRawQuerySourceData {
  placeholders: IRawQuerySourceDataPlaceholder[];
  queryString: string;
  queryType: 'get' | 'post' | 'sql';
}

export interface IRawQuerySourceDataPlaceholder {
  required: boolean;
  disabled: boolean;
  placeholder: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectArr: any | null;
  type: RawQuerySourceDataParamsType;
  value: string;
  isTreeEnable?: boolean;
  selectedPathArray?: string[] | null;
}

export type RawQuerySourceDataParamsType = 'string' | 'select' | 'omObject' | 'date';

export type RawQuerySourceDataTemplateType = 'none' | 'status' | 'bar' | 'table'; // нет привязки, только что бы обозначить тип запроса

export interface IRawQuerySourceDataTemplate {
  type: RawQuerySourceDataTemplateType;
  name: string;
  value: string;
  paramsMap?: Map<
    string,
    {
      type: RawQuerySourceDataParamsType;
      required: boolean;
      disabled: boolean;
      value: string | null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selectArr?: any;
      isTreeEnable?: boolean;
      selectedPathArray?: string[] | null;
    }
  >;
}
