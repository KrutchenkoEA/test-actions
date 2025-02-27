/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { IOMAttribute } from '../../../../models';
import { RtdbOmApiService } from '../../../../services';
import { PlayerService, ViewerOMService, ViewerService } from '../../../pure-modules';

@Injectable()
export class ViewerBufferOmService {
  private readonly viewerService = inject(ViewerService);
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly playerService = inject(PlayerService);
  private readonly viewerOMService = inject(ViewerOMService);

  public getData(): Observable<boolean> {
    const opt: {
      elementGuid: string;
      attributeIds: string[];
    }[] = [];
    const optRounded = [];

    const startTime = this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferFromIndex].toISOString();
    const endTime = this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferToIndex].toISOString();

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of this.viewerOMService.omAttrMap.get('default')) {
      opt.push({
        elementGuid: key,
        attributeIds: Array.from(value),
      });
    }
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of this.viewerOMService.omAttrMap.get('rounded')) {
      optRounded.push({
        elementGuid: key,
        attributeIds: Array.from(value),
      });
    }

    if (!opt.length && !optRounded.length) {
      return of(false);
    }

    const stream1$ = opt.length
      ? forkJoin(
          opt.map((v) => this.rtdbOmApiService.getOMAttributes(v.elementGuid, v.attributeIds, startTime, endTime))
        )
      : of([]);
    const stream2$ = optRounded.length
      ? forkJoin(
          optRounded.map((v) =>
            this.rtdbOmApiService.getOMAttributes(v.elementGuid, v.attributeIds, startTime, endTime)
          )
        )
      : of([]);

    return forkJoin([stream1$, stream2$]).pipe(
      map(([attrs, attrsRounded]) => {
        this.createData([
          ...attrs.map((attr) => {
            return Object.assign(attr, { withFormat: false });
          }),
          ...attrsRounded.map((attr) => {
            return Object.assign(attr, { withFormat: true });
          }),
        ]);
        return true;
      }),
      catchError((e) => {
        throw Error(e);
      })
    );
  }

  public createData(attrs: IOMAttribute[]): void {
    attrs.forEach((attr) => {
      attr?.data?.forEach((d) => {
        let tagM = this.playerService.omMap.get(d?.attributeId).defaultFormat;
        if (attr?.withFormat) {
          tagM = this.playerService.omMap.get(d?.attributeId).withFormat;
        }
        d?.values?.forEach((p) => {
          tagM.set(new Date(p.timeStamp).setMilliseconds(0), {
            ...p,
            attributeId: d.attributeId,
            withFormat: attr.withFormat,
          });
        });
      });
    });

    if (this.viewerService.mnemoUpdateType === 'rest' && this.viewerOMService.omAttrInit$.value) {
      // if (!tag?.points?.length) {
      // this.viewerLoggerService.catchMessage('error', 'mnemo.ViewerPlayerComponent.loadingUnavailable')
      // }

      this.viewerService.isLoadingViewer$.next(false);
    }
  }
}
