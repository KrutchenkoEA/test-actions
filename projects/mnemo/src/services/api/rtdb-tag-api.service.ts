/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { catchError, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IControlTags, IPostTag, ITagHistoryData, ITagsMeta, ITagsValues } from '../../models';
import { MnemoLoggerService } from '../logger';

@Injectable()
export class RtdbTagApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public RTDB_PROXY_METHOD_KEY: 'current' | 'values' = 'values';
  private readonly TAGS_ENDPOINT = '/api/rtdb-proxy/tags';

  public getTags(searchString: string = '', offset: number = 0, limit: number = 100): Observable<IControlTags> {
    let params: HttpParams = new HttpParams();
    if (searchString) {
      params = params.set('Name', searchString);
    }
    if (offset) {
      params = params.set('Offset', offset);
    }
    if (limit) {
      params = params.set('Limit', limit);
    }

    return this.httpClient.get<IControlTags>(this.endpoint.url(this.TAGS_ENDPOINT), { params });
  }

  public getTagHistoryByArray(
    names?: string[],
    offset?: string,
    limit?: string,
    from?: string,
    to?: string,
    withFormat?: boolean,
    scale?: boolean,
    intervalsCount?: number,
  ): Observable<ITagHistoryData[]> {
    let params: HttpParams = new HttpParams();
    if (from?.length && to?.length) {
      params = params.set('StartTime', from).set('EndTime', to);
    }
    if (offset) {
      params = params.set('Offset', offset);
    }
    if (limit) {
      params = params.set('Limit', limit);
    }
    if (withFormat) {
      params = params.set('WithFormat', withFormat);
    }
    if (scale) {
      params = params.set('Scale', scale);
    }
    if (intervalsCount) {
      params = params.set('IntervalsCount', intervalsCount);
    }

    if (names?.length) {
      params = params.append('Names', names.join(','));
    } else {
      return of([]);
    }

    return this.httpClient.get<ITagHistoryData[]>(this.endpoint.url(`${this.TAGS_ENDPOINT}/history`), { params }).pipe(
      map((arr) => {
        return arr.map((a) => {
          return { id: a.id, name: a.name, points: a.points.reverse(), guid: a.guid, withFormat };
        });
      }),
      catchError((e) => {
        this.mnemoLoggerService.catchErrorMessage(
          'warning',
          `Ошибка ${e}, при получение тегов ${names.toString()}`,
          null,
          false,
        );
        return [
          names.map((name) => {
            return { id: null, name, points: [], guid: 'Error' };
          }),
        ];
      }),
    );
  }

  // Проверяем, существует ли /current и /values методы на беке
  public checkMethodType(tagNames?: string[], idMap?: Map<string, number>, guidMap?: Map<string, number>): void {
    if (!tagNames?.length) return;

    let params: HttpParams = new HttpParams();
    params = params.set('WithFormat', false);
    params = params.set('TagNames', tagNames.join(','));

    const checkCurrent = (): void => {
      params = params.delete('TagNames');
      params = params.set('Names', tagNames.join(','));
      this.getTagValueByArrayCurrent(params)
        .pipe(
          catchError((e: HttpErrorResponse) => {
            this.mnemoLoggerService.catchErrorMessage('warning', `Метод current не поддерживается \n`, e, false);
            return [];
          }),
        )
        .subscribe((tags: ITagsValues[]) => {
          if (tags?.length) {
            this.RTDB_PROXY_METHOD_KEY = 'current';
            tags?.forEach((tag) => guidMap?.set(tag.name, tag.guid));
          }
        });
    };

    this.getTagValueByArrayValues(params)
      .pipe(
        catchError((e: HttpErrorResponse) => {
          this.mnemoLoggerService.catchErrorMessage('warning', `Метод values не поддерживается \n`, e, false);
          checkCurrent();
          return [];
        }),
      )

      .subscribe((tags: ITagsValues[]) => {
        if (tags?.length) {
          this.RTDB_PROXY_METHOD_KEY = 'values';
          tags?.forEach((tag) => idMap?.set(tag.name, tag.id));
        }
        checkCurrent();
      });
  }

  public getTagValueByArray(tagNames?: string[], withFormat?: boolean): Observable<ITagsValues[]> {
    let params: HttpParams = new HttpParams();
    if (withFormat) {
      params = params.set('WithFormat', withFormat);
    }
    if (tagNames?.length) {
      params = params.append(this.RTDB_PROXY_METHOD_KEY === 'current' ? 'Names' : 'TagNames', tagNames.join(','));
    } else {
      return of([]);
    }

    return (
      this.RTDB_PROXY_METHOD_KEY === 'current'
        ? this.getTagValueByArrayCurrent(params)
        : this.getTagValueByArrayValues(params)
    ).pipe(
      catchError((e: HttpErrorResponse) => {
        this.mnemoLoggerService.catchErrorMessage(
          'warning',
          `Ошибка ${e}, при получение тегов ${tagNames.toString()}`,
          null,
          false,
        );
        return [
          tagNames.map((name) => {
            return { name, val: null, status: null, guid: null, time: null, withFormat };
          }),
        ];
      }),
    );
  }

  public getTagMetaByArray(names: string[]): Observable<ITagsMeta[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('Limit', 0);
    params = params.set('Offset', 0);
    if (names?.length) {
      params = params.set('Names', names.join(','));
    } else {
      return of([]);
    }

    return this.httpClient
      .get<{ list: ITagsMeta[] }>(this.endpoint.url(this.TAGS_ENDPOINT), { params })
      .pipe(map((v) => v?.list ?? []));
  }

  public postManualTagData(params: IPostTag[]): Observable<unknown> {
    return this.httpClient.post<ITagHistoryData[]>(
      this.endpoint.url(`${this.TAGS_ENDPOINT}/${this.RTDB_PROXY_METHOD_KEY}`),
      params,
    );
  }

  private getTagValueByArrayValues(params: HttpParams): Observable<ITagsValues[]> {
    return this.httpClient.get<ITagsValues[]>(this.endpoint.url(`${this.TAGS_ENDPOINT}/values`), { params });
  }

  private getTagValueByArrayCurrent(params: HttpParams): Observable<ITagsValues[]> {
    return this.httpClient
      .get<{ list: ITagsValues[] }>(this.endpoint.url(`${this.TAGS_ENDPOINT}/current`), { params })
      .pipe(map((v) => v?.list ?? []));
  }
}
