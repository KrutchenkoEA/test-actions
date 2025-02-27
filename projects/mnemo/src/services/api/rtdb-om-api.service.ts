/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { catchError, Observable } from 'rxjs';
import { IOMAttribute, IOMAttributeAll } from '../../models';

@Injectable()
export class RtdbOmApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  private readonly UNIVERSAL_STORAGE_ENDPOINT = '/api/universal-storage-adapters-rtdb/us/rtdb';

  public getOMAttributeAll(elementGuid: string, withFormat: boolean = false): Observable<IOMAttributeAll> {
    let params: HttpParams = new HttpParams();
    params = params.set('MaxLevel', 0);
    params = params.set('IncludeAttributes', true);
    params = params.set('WithFormat', withFormat);
    return this.httpClient.get<IOMAttributeAll>(
      this.endpoint.url(`${this.UNIVERSAL_STORAGE_ENDPOINT}/elements/getbyid/${elementGuid}`),
      { params }
    );
  }

  public getOMAttributes(
    elementGuid: string,
    attributeIds: string[],
    startTime: string,
    endTime: string
  ): Observable<IOMAttribute> {
    let params: HttpParams = new HttpParams();
    attributeIds?.forEach((attr) => {
      params = params.append('AttributeIds', attr);
    });
    params = params.set('StartTime', startTime);
    params = params.set('EndTime', endTime);
    return this.httpClient
      .get<IOMAttribute>(
        this.endpoint.url(`${this.UNIVERSAL_STORAGE_ENDPOINT}/elements/${elementGuid}/attributes/batch/values`),
        { params }
      )
      .pipe(
        catchError(() => {
          return [
            {
              name: 'err',
              id: elementGuid,
              data: [],
            } as IOMAttribute,
          ];
        })
      );
  }
}
