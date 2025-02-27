/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { Observable } from 'rxjs';
import { IObjectPort } from '../../models';

@Injectable()
export class RtdbPortsApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  private readonly OBJECTS_ENDPOINT = '/api/mdlproxy-adapter/objects';

  public getPorts(guid: string): Observable<IObjectPort[]> {
    const url = this.endpoint.url(`${this.OBJECTS_ENDPOINT}/${guid}/ports`);
    return this.httpClient.get<IObjectPort[]>(url);
  }
}
