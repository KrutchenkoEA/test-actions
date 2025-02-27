export interface IControlTags {
  limit: number;
  offset: number;
  list: ITagsResponse[];
}

export interface ITagsResponse {
  guid?: number;
  name: string;
  objectId?: number;
  status: boolean;
  tagsType?: string;
  value?: string;
  format?: string;
  originalName?: string;
  valueType?: string;
  valueTypeName?: string;
  unitName?: string;

  // Добавляется для модификации (не приходит с бека)
  isSelected?: boolean;
}
