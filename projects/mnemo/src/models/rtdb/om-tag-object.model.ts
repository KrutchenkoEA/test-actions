export interface IDetailedObject {
  guid: string;
  name: string;
  attributes: IObjectAttribute[];
  system: boolean;
  path: string;

  type: number;
  level?: number;
  parentGuid: string;
  children: string[];
}

export interface IObjectAttribute {
  guid: string;
  name: string;
  description: string;
  format: string;
  value: {
    count: number;
    status: number;
    statusName: string;
    time: string;
    value: string;
  };
  path: string;
  inputData: string;
  dataType: number;
  dataTypeName: string;
  valueType: number;
  valueTypeName: string;

  // Добавляется для модификации (не приходит с бека)
  isSelected?: boolean;
}
