/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortByNameFunction } from '../../functions';
import { IObjectPort, ISortedObjectPorts, PortTypeEnum } from '../../models';
import { RtdbPortsApiService } from '../api';

@Injectable()
export class RtdbPortsService {
  private readonly rtdbPortsApiService = inject(RtdbPortsApiService);

  public getPorts(guid: string): Observable<ISortedObjectPorts> {
    if (!guid) {
      return of({
        portsIn: [],
        portsOut: [],
        portsNonDirectional: [],
      });
    }

    return this.rtdbPortsApiService.getPorts(guid).pipe(
      map((ports) => {
        return {
          portsIn: this.getSortedPorts(ports, PortTypeEnum.Receiver),
          portsOut: this.getSortedPorts(ports, PortTypeEnum.Source),
          portsNonDirectional: this.getSortedPorts(ports, PortTypeEnum.NonDirectional),
        };
      }),
    );
  }

  private getSortedPorts(ports: IObjectPort[], type: PortTypeEnum): IObjectPort[] {
    return ports.filter((port) => port.type === type).sort((a, b) => sortByNameFunction(a, b));
  }
}
