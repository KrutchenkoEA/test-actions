/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { Observable } from 'rxjs';
import { IModelConnection } from '../../models';

@Injectable()
export class RtdbConnectionsApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  private readonly MODEL_ENDPOINT = '/api/mdlproxy-adapter/models';

  public getConnections(guid: string, elementGuid: string): Observable<IModelConnection[]> {
    let params = new HttpParams();
    if (elementGuid) {
      params = params.set('ElementGuid', elementGuid);
    }

    const url = this.endpoint.url(`${this.MODEL_ENDPOINT}/${guid}/connections`);
    return this.httpClient.get<IModelConnection[]>(url, { params });
  }
}
