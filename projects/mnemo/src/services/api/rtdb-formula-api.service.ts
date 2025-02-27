/* eslint-disable import/no-extraneous-dependencies */
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AS_HTTP, EndpointService } from '@tl-platform/core';
import { catchError, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFormulaCalcRes, IFormulaReference } from '../../models';

@Injectable()
export class RtdbFormulaApiService {
  private readonly httpClient = inject<HttpClient>(AS_HTTP);
  private readonly endpoint = inject(EndpointService);

  public RTDB_PROXY_KEY: '/api/rtdb-proxy' | '/api/platform-rtdb-calculation' = '/api/rtdb-proxy';
  private readonly RTDB_ENDPOINT = '/api/rtdb-proxy';
  private readonly RTDB_CALC_ENDPOINT = '/api/platform-rtdb-calculation';

  public checkMethodType(): void {
    let params: HttpParams = new HttpParams();
    params = params.set('Formula', 1);
    const checkCalculation = (): void => {
      this.httpClient
        .get<IFormulaCalcRes>(this.endpoint.url(`${this.RTDB_CALC_ENDPOINT}/calcs/do`), { params })
        .pipe(
          catchError((e: HttpErrorResponse) => {
            console.error('e', e);
            return [];
          })
        )
        .subscribe((res: IFormulaCalcRes) => {
          if (res.valid && res?.result) {
            this.RTDB_PROXY_KEY = this.RTDB_CALC_ENDPOINT;
          }
        });
    };

    this.httpClient
      .get<IFormulaCalcRes>(this.endpoint.url(`${this.RTDB_ENDPOINT}/calcs/do`), { params })
      .pipe(
        catchError((e: HttpErrorResponse) => {
          console.error('e', e);
          checkCalculation();
          return [];
        })
      )
      .subscribe((res: IFormulaCalcRes) => {
        if (res.valid && res?.result) {
          this.RTDB_PROXY_KEY = this.RTDB_ENDPOINT;
        }
        checkCalculation();
      });
  }

  public getReference(): Observable<IFormulaReference[]> {
    let params: HttpParams = new HttpParams();
    params = params.set('Offset', 0);
    params = params.set('Limit', 100);

    const headers: HttpHeaders = new HttpHeaders();
    headers.append('Cache', 'cache');

    return this.httpClient
      .get<{ list: IFormulaReference[] }>(this.endpoint.url(`${this.RTDB_ENDPOINT}/references/engunits`), {
        params,
        headers,
      })
      .pipe(map((res) => res?.list ?? []));
  }

  // IFormulaCalcRes || IDashboardRawData

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getCalcByFormula<U>(formula: string): Observable<U> {
    let params: HttpParams = new HttpParams();
    params = params.set('Formula', formula);
    // @ts-ignore
    // return of(getMockTableRawResponse());
    return this.httpClient.get<U>(this.endpoint.url(`${this.RTDB_PROXY_KEY}/calcs/do`), {
      params,
    });
  }
}
