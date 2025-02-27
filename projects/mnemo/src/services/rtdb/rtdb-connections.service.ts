/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortByNameFunction } from '../../functions';
import { IModelConnection, ISortedObjectConnections, PortTypeEnum } from '../../models';
import { RtdbConnectionsApiService } from '../api';

@Injectable()
export class RtdbConnectionsService {
  private readonly rtdbConnectionsApiService = inject(RtdbConnectionsApiService);

  public getConnections(guid: string, elementGuid: string): Observable<ISortedObjectConnections> {
    if (!guid || !elementGuid) {
      return of({
        connectionsIn: [],
        connectionsOut: [],
        connectionsNonDirectional: [],
        connectionsInByPortGuid: {},
        connectionsOutByPortGuid: {},
        connectionsNonDirectionalByPortGuid: {},
      });
    }

    return this.rtdbConnectionsApiService.getConnections(guid, elementGuid).pipe(
      map((connections) => {
        const connectionsIn = this.getSortedConnections(connections, PortTypeEnum.Receiver, 'portReceiver');
        const connectionsOut = this.getSortedConnections(connections, PortTypeEnum.Source, 'portSource');
        const connectionsNonDirectional = this.getSortedConnections(
          connections,
          PortTypeEnum.NonDirectional,
          'portReceiver'
        );

        return {
          connectionsIn,
          connectionsOut,
          connectionsNonDirectional,
          connectionsInByPortGuid: this.getConnectionsByPortGuid(connectionsIn, PortTypeEnum.Receiver),
          connectionsOutByPortGuid: this.getConnectionsByPortGuid(connectionsOut, PortTypeEnum.Source),
          connectionsNonDirectionalByPortGuid: this.getConnectionsByPortGuidNonDirectional(
            connectionsNonDirectional,
            elementGuid
          ),
        };
      })
    );
  }

  private getSortedConnections(
    connections: IModelConnection[],
    type: PortTypeEnum,
    field: 'portReceiver' | 'portSource'
  ): IModelConnection[] {
    return connections.filter((connection) => connection?.[field]?.type === type);
  }

  private getConnectionsByPortGuid(
    connections: IModelConnection[],
    type: PortTypeEnum
  ): Record<string, IModelConnection[]> {
    const objectPortName = type === PortTypeEnum.Receiver ? 'portReceiver' : 'portSource';
    const connectionPortName = type === PortTypeEnum.Source ? 'portReceiver' : 'portSource';
    const connectionsByPortGuid: Record<string, IModelConnection[]> = {};

    connections?.forEach((connection) => {
      if (connectionsByPortGuid[connection[objectPortName].guid]) {
        connectionsByPortGuid[connection[objectPortName].guid].push(connection);
      } else {
        connectionsByPortGuid[connection[objectPortName].guid] = [connection];
      }
    });

    Object.keys(connectionsByPortGuid).forEach((key) => {
      connectionsByPortGuid[key].sort((a, b) =>
        sortByNameFunction(a[connectionPortName].object, b[connectionPortName].object)
      );
    });
    return connectionsByPortGuid;
  }

  private getConnectionsByPortGuidNonDirectional(
    connections: IModelConnection[],
    guid: string
  ): Record<string, IModelConnection[]> {
    const connectionsByPortGuid: Record<string, IModelConnection[]> = {};
    connections?.forEach((connection) => {
      const isSource = connection.portSource.object.guid === guid;
      const isReceiver = connection.portReceiver.object.guid === guid;

      if (isSource) {
        const objectPortName = 'portSource';
        if (connectionsByPortGuid[connection[objectPortName].guid]) {
          connectionsByPortGuid[connection[objectPortName].guid].push(connection);
        } else {
          connectionsByPortGuid[connection[objectPortName].guid] = [connection];
        }
      }

      if (isReceiver) {
        const objectPortName = 'portReceiver';
        if (connectionsByPortGuid[connection[objectPortName].guid]) {
          connectionsByPortGuid[connection[objectPortName].guid].push(connection);
        } else {
          connectionsByPortGuid[connection[objectPortName].guid] = [connection];
        }
      }
    });

    Object.keys(connectionsByPortGuid).forEach((key) => {
      connectionsByPortGuid[key].sort((a, b) => {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const isASource = a.portSource.object.guid === guid;
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const isBSource = a.portSource.object.guid === guid;

        // eslint-disable-next-line @typescript-eslint/naming-convention
        const connectionAPortName = !isASource ? 'portReceiver' : 'portSource';
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const connectionBPortName = !isBSource ? 'portReceiver' : 'portSource';
        return sortByNameFunction(a[connectionAPortName].object, b[connectionBPortName].object);
      });
    });

    return connectionsByPortGuid;
  }
}
