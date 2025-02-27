export interface ITreeItem {
  id: string;
  parentId?: string;
  type: TreeOptType;
  name: string;
  description?: string;
  items?: ITreeItem[];
  fileId?: string;

  level?: number;
  isLoading?: boolean;
  expandable?: boolean;
  path?: string;
}

export interface IEditItem {
  name: string;
  description: string;
}

export interface IResultTreeData {
  folderId: string | null;
  nodeId: string | null;
  // name: string | null;
  type: TreeOptType;
  fileId?: string;
}

export type TreeOptType = 'folder' | 'mnemoscheme' | 'table' | 'dashboard' | 'table2';

export interface ITreeConfig {
  type: TreeOptType;
  name?: string;
}

export interface IPostFolderOrFile {
  parentId: string;
  type: TreeOptType;
  name: string;
  description: string;
  fileId?: string;
}

export interface IPutFolderOrFile {
  id: string;
  parentId: string;
  type: TreeOptType;
  name: string;
  description: string;
  fileId?: string;
  nameChange: boolean;
}

export interface IXmlDiagram {
  xml: string | null;
  json: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table?: any | null; // ITableStructure | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dashboard?: Array<any> | null; // Array<IDashboardItem> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  table2?: any | null;
}

export interface IPostItem {
  name: string;
  file: File | Blob | null;
  type: TreeOptType;
}
