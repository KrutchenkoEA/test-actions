/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable, OnDestroy } from '@angular/core';
import { uuidGenerate } from '@tl-platform/core';
import { skip, Subscription } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import {
  ActiveShapesAbstractClass,
  IMnemoChartDateOptions,
  ITagHistoryData,
  ITagsValues,
} from '../../../../../models';
import { MnemoLoggerService, RtdbTagApiService } from '../../../../../services';
import { ViewerIntervalService, ViewerMapperService, ViewerService, ViewerTagService } from '../../../../pure-modules';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesService } from './active-shapes.service';

@Injectable()
export class ActiveShapesTagService implements ActiveShapesAbstractClass<ITagsValues[], ITagHistoryData[]>, OnDestroy {
  public viewerService = inject(ViewerService);
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public subscriptions: Subscription[] = [];
  public updateEnabled: boolean = true;
  public uuid = uuidGenerate();
  public lastUpdateDate: IMnemoChartDateOptions | null = null;

  public ngOnDestroy(): void {
    this.viewerTagService.cleanData();
    this.destroySubs();
  }

  public initSubs(): void {
    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(
        skip(1),
        filter(() => this.updateEnabled && this.viewerTagService.isTagsInitActiveShapes$.value),
      )
      .subscribe(() => {
        this.getHistoryData(
          this.lastUpdateDate?.end ?? new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
          new Date(),
        );
      });

    this.subscriptions.push(intervalSub$);
  }

  public destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public getHistoryData(start: Date, end: Date, scale?: boolean, intervalsCount?: number): void {
    this.lastUpdateDate = { start, end };
    const tagsNames = this.viewerTagService.tagsNamesOnlyActiveShapes$.value;
    if (!tagsNames?.length) return;
    this.activeShapesService.isLoading$.next(true);
    this.rtdbTagApiService
      .getTagHistoryByArray(tagsNames, '0', '0', start.toISOString(), end.toISOString(), false, scale, intervalsCount)
      .pipe(takeUntil(this.viewerService.viewerMnemoDestroy$))
      .subscribe({
        next: (data) => this.sortHistoryData(data),
        error: (err) => {
          this.activeShapesService.isLoading$.next(false);
          this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.shared.error', err);
        },
      });
  }

  public sortHistoryData(data: ITagHistoryData[]): void {
    data.forEach((t) => {
      const existValues = this.activeShapesRealtimeService.tagNameDataMap.get(t.name) ?? [];
      const newValues = t.points?.map((p) => this.viewerMapperService.prepareTagDataMapRest(p)) ?? [];

      if (!!existValues && this.activeShapesService.fixedPointsRealtimeValuesMap?.size) {
        const existValuesLength = existValues?.length;
        const newValuesLength = newValues?.length;
        this.activeShapesRealtimeService.tagNameDataMap.set(t.name, [
          ...newValues,
          ...existValues.slice(0, existValuesLength - newValuesLength),
        ]);
      } else {
        this.activeShapesRealtimeService.tagNameDataMap.set(t.name, [...newValues, ...existValues]);
      }
    });
    this.activeShapesService.isLoading$.next(false);
    this.activeShapesRealtimeService.nextRealtimeData();
  }
}
