/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, OnDestroy } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { IDetailedObject, IObjectAttribute, IResponseTreeItem, ObjectEntityTypeEnum } from '../../../models';

@Injectable()
export class OmTreeService implements OnDestroy {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  private readonly TREE_ENDPOINT = '/api/mdlproxy-adapter/references/elementsTree';
  private readonly OBJECT_ENDPOINT = '/api/mdlproxy-adapter/objects';

  private readonly modelTreeByGuidMap: Map<string, IResponseTreeItem[]> = new Map();
  private readonly objectAttributesMap: Map<string, IDetailedObject> = new Map();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private interval: any;

  public ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  public getFullTrees(useLocalCache: boolean = true): Observable<IResponseTreeItem[]> {
    this.startLocalInterval();
    return this.getTreeFromObjects(useLocalCache, 2050);
  }

  public getTreeFromObjects(useLocalCache: boolean, entityType: ObjectEntityTypeEnum): Observable<IResponseTreeItem[]> {
    const cachedModel = this.modelTreeByGuidMap.get('2050');
    if (useLocalCache && cachedModel) {
      return of(cachedModel) as Observable<IResponseTreeItem[]>;
    }

    const params = new HttpParams({
      fromObject: {
        entityType,
      },
    });
    const url = this.endpoint.url(this.TREE_ENDPOINT);
    return this.httpClient.get<IResponseTreeItem[]>(url, { params }).pipe(
      map((d) => {
        this.modelTreeByGuidMap.set('2050', d);
        return d;
      }),
    );
  }

  public getObjectAttributes(guid: string, useLocalCache: boolean = true): Observable<IDetailedObject> {
    const cachedObject = this.objectAttributesMap.get(guid);
    if (useLocalCache && cachedObject) {
      return of(cachedObject) as Observable<IDetailedObject>;
    }

    const url = this.endpoint.url(`${this.OBJECT_ENDPOINT}/${guid}/attributes`);
    let params: HttpParams = new HttpParams();
    params = params.set('WithFormat', true);
    params = params.set('Timestamp', new Date().toISOString());
    return this.httpClient.get<IObjectAttribute[]>(url, { params }).pipe(
      map((d) => {
        const attrObject = {
          path: d[0]?.path.split('|')?.[0] ?? '',
          guid,
          attributes: d,
        } as IDetailedObject;

        this.objectAttributesMap.set(guid, attrObject);

        return attrObject;
      }),
    );
  }

  private startLocalInterval(): void {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.modelTreeByGuidMap.clear();
      this.objectAttributesMap.clear();
    }, 300000);
  }
}
