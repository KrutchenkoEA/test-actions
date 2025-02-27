/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_CONFIG, AS_HTTP, DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';
import {
  IEditItem,
  IPostFolderOrFile,
  IPostItem,
  IPutFolderOrFile,
  ITreeItem,
  IXmlDiagram,
  TreeOptType,
} from '../../models';

@DecorateUntilDestroy()
@Injectable()
export class MnemoschemeTreeApiService {
  private readonly http = inject<HttpClient>(AS_HTTP);

  private readonly appConfig = inject(AS_CONFIG, { optional: false });
  private readonly restUrl: string = this.appConfig.restUrl;

  public getItemsList(): Observable<ITreeItem[]> {
    return this.http.get<ITreeItem[]>(`${this.restUrl}/api/mnemoscheme-tree/items/list`);
  }

  public getItemById(id: string): Observable<ITreeItem> {
    return this.http.get<ITreeItem>(`${this.restUrl}/api/mnemoscheme-tree/items/${id}`);
  }

  public postItem(treeItem: IPostFolderOrFile): Observable<ITreeItem> {
    return this.http.post<ITreeItem>(`${this.restUrl}/api/mnemoscheme-tree/items`, treeItem);
  }

  public putItem(id: string, treeItem: IEditItem): Observable<HttpResponse<ITreeItem>> {
    return this.http.put<ITreeItem>(`${this.restUrl}/api/mnemoscheme-tree/items/${id}`, treeItem, {
      observe: 'response',
    });
  }

  public putItemNewUrl(id: string, fileId: string): Observable<HttpResponse<ITreeItem>> {
    return this.http.put<ITreeItem>(
      `${this.restUrl}/api/mnemoscheme-tree/items/file/${id}`,
      { fileId },
      { observe: 'response' }
    );
  }

  public deleteItem(id: string): Observable<HttpResponse<{ message: string }>> {
    return this.http.delete<{
      message: string;
    }>(`${this.restUrl}/api/mnemoscheme-tree/items/${id}`, { observe: 'response' });
  }

  public getXmlFromFileStorage(id?: string): Observable<IXmlDiagram> {
    return this.http
      .get(`${this.restUrl}/api/file-storage/content/${id}`, { observe: 'body', responseType: 'text' })
      .pipe(
        map((encryptedXml) => {
          const diagram: IXmlDiagram = {
            xml: encryptedXml,
            json: null,
          };
          return diagram;
        })
      );
  }

  public getJsonFromFileStorage(id?: string): Observable<string> {
    return this.http.get(`${this.restUrl}/api/file-storage/content/${id}`, { observe: 'body', responseType: 'text' });
  }

  public postXmlInFileStorage(item: { name: string; file: File | Blob | null; type: TreeOptType }): Observable<string> {
    const formData: FormData = new FormData();
    formData.append('fileName', item.name);
    formData.append('uploadFile', item.file);
    return this.http.post<string>(`${this.restUrl}/api/file-storage`, formData);
  }

  public postData(postFile: IPostItem, folderId: string, name: string, type: TreeOptType): Observable<ITreeItem> {
    return this.postXmlInFileStorage(postFile).pipe(
      switchMap((response) => {
        if (response) {
          const postScheme: IPostFolderOrFile = {
            parentId: folderId,
            description: name,
            name,
            type,
            fileId: response ?? null,
          };
          return this.postItem(postScheme);
        }
        return of(null);
      }),
      catchError((error) => throwError(error)),
      takeUntilDestroyed(this)
    );
  }

  public putData(postFile: IPostItem, d: IPutFolderOrFile): Observable<unknown> {
    return this.postXmlInFileStorage(postFile).pipe(
      switchMap((fileId) => this.putItemNewUrl(d.id, fileId)),
      switchMap((response) => {
        if (response && d.nameChange) {
          return this.putItem(d.id, { name: d.name, description: d.description });
        }
        return [1];
      }),
      catchError((error) => throwError(error)),
      takeUntilDestroyed(this)
    );
  }
}
