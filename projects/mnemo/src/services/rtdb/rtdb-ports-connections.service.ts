/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';
import { IPortConnectionModel } from '../../models';
import { RtdbConnectionsService } from './rtdb-connections.service';
import { RtdbPortsService } from './rtdb-ports.service';

@Injectable()
export class RtdbPortsConnectionsService {
  private readonly rtdbConnectionsService = inject(RtdbConnectionsService);
  private readonly rtdbPortsService = inject(RtdbPortsService);

  public getPortConnectionModel(guid: string, elementGuid: string): Observable<IPortConnectionModel> {
    return forkJoin([
      this.rtdbPortsService.getPorts(elementGuid),
      this.rtdbConnectionsService.getConnections(guid, elementGuid),
    ]).pipe(
      map(([ports, connections]) => {
        return Object.assign(ports, connections, { modelGuid: guid });
      })
    );
  }
}
