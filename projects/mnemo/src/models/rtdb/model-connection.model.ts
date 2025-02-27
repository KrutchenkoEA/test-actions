import { PortTypeEnum } from './port.enum';

export interface IModelConnection {
  guid: string;
  portReceiver: IPortReceiver;
  portSource: IPortReceiver;
  lockAt: string;
  lockBy: ILockBy;
}

interface ILockBy {
  guid: string;
  login: string;
  name: string;
}

interface IPortReceiver {
  guid: string;
  name: string;
  object: IObject;
  type?: PortTypeEnum;
}

interface IObject {
  guid: string;
  name: string;
}

// custom
export interface ISortedObjectConnections {
  connectionsIn: IModelConnection[];
  connectionsOut: IModelConnection[];
  connectionsNonDirectional: IModelConnection[];
  connectionsInByPortGuid: Record<string, IModelConnection[]>;
  connectionsOutByPortGuid: Record<string, IModelConnection[]>;
  connectionsNonDirectionalByPortGuid: Record<string, IModelConnection[]>;
}
