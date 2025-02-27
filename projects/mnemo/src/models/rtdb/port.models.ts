import { ISortedObjectConnections } from './model-connection.model';
import { PortDirectionEnum, PortTypeEnum } from './port.enum';

export interface IObjectPort {
  guid: string;
  connectionType: number;
  connectionTypeName: string;
  description: string;
  limit: number;
  lockAt: string;
  lockBy: {
    guid: string;
    login: string;
    name: string;
  };
  name: string;
  type: number;
  typeName: string;
}

// custom
export interface ISortedObjectPorts {
  portsIn: IObjectPort[];
  portsOut: IObjectPort[];
  portsNonDirectional: IObjectPort[];
}

export interface IMxCellPort extends IMxCellPortObject {
  portGuid?: string;
  portType?: PortTypeEnum;
  portDirection?: PortDirectionEnum;
}

export interface IPortConnectionModel extends ISortedObjectPorts, ISortedObjectConnections {
  modelGuid?: string;
}

export interface IMxCellPortObject {
  objectGuid?: string;
  modelGuid?: string;
}
