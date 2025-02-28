/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable, OnDestroy } from '@angular/core';
import { forkJoin, skip, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  ActiveShapesAbstractClass,
  IMnemoChartDateOptions,
  IOMAttribute,
  IOMAttributeAll,
} from '../../../../../models';
import { MnemoLoggerService, RtdbOmApiService } from '../../../../../services';
import { ViewerIntervalService, ViewerMapperService, ViewerOMService, ViewerService } from '../../../../pure-modules';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesService } from './active-shapes.service';

@Injectable()
export class ActiveShapesOmService implements ActiveShapesAbstractClass<IOMAttributeAll[], IOMAttribute[]>, OnDestroy {
  public viewerService = inject(ViewerService);
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public subscriptions: Subscription[] = [];
  public updateEnabled: boolean = true;

  public lastUpdateDate: IMnemoChartDateOptions | null = null;

  public ngOnDestroy(): void {
    this.viewerOMService.cleanData();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public initSubscribe(): void {
    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(
        skip(1),
        filter(() => this.updateEnabled && this.viewerOMService.omAttrInitActiveShapes$.value),
      )
      .subscribe(() =>
        this.getHistoryData(
          this.lastUpdateDate?.end ?? new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
          new Date(),
        ),
      );

    this.subscriptions.push(intervalSub$);
  }

  public getHistoryData(start: Date, end: Date): void {
    this.lastUpdateDate = { start, end };
    const currentMap = this.viewerOMService.omAttrMap.get('active-shapes');
    if (!currentMap.size) return;

    const opt: {
      elementGuid: string;
      attributeIds: string[];
    }[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of currentMap) {
      opt.push({
        elementGuid: key,
        attributeIds: Array.from(value),
      });
    }

    if (!opt.length) return;

    this.activeShapesService.isLoading$.next(true);

    forkJoin(
      opt.map((v) =>
        this.rtdbOmApiService.getOMAttributes(v.elementGuid, v.attributeIds, start.toISOString(), end.toISOString()),
      ),
    )
      .pipe(takeUntil(this.viewerService.viewerMnemoDestroy$))
      .subscribe({
        next: (data: IOMAttribute[]) => this.sortHistoryData(data),
        error: (err) => {
          this.activeShapesService.isLoading$.next(false);
          this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.shared.error', err);
        },
      });
  }

  public sortHistoryData(data: IOMAttribute[]): void {
    data?.forEach((d) => {
      d.data?.forEach((attr) => {
        const existValues = this.activeShapesRealtimeService.omAttrDataMap.get(attr.attributeId) ?? [];
        const newValues = attr.values?.map((p) => this.viewerMapperService.prepareOmAttrDataMapRest(p)) ?? [];
        if (!!existValues && this.activeShapesService.fixedPointsRealtimeValuesMap?.size) {
          const existValuesLength = existValues?.length;
          const newValuesLength = newValues?.length;
          this.activeShapesRealtimeService.omAttrDataMap.set(attr.attributeId, [
            ...newValues,
            ...existValues.slice(0, existValuesLength - newValuesLength),
          ]);
        } else {
          this.activeShapesRealtimeService.omAttrDataMap.set(attr.attributeId, [...newValues, ...existValues]);
        }
      });
    });
    this.activeShapesService.isLoading$.next(false);
    this.activeShapesRealtimeService.nextRealtimeData();
  }
}
