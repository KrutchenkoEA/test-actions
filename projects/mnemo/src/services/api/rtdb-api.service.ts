/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { HttpClient } from '@angular/common/http';
import { IConnection } from '../../models';

@Injectable()
export class RtdbApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  private readonly RTDB_ENDPOINT = '/api/rtdb-proxy';
  private readonly CONNECTIONS_ENDPOINT = '/api/mdlproxy-adapter/references/rtdbconnections';

  public getConnections(): Observable<IConnection[]> {
    return this.httpClient.get<IConnection[]>(this.endpoint.url(this.CONNECTIONS_ENDPOINT));
  }
}
