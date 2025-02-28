/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable, OnDestroy } from '@angular/core';
import { DATES_GLOBAL$, IDatesInterval, StoreObservable } from '@tl-platform/core';
import { filter, Subscription } from 'rxjs';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS } from '../../../../../consts';
import {
  IDashboardItem,
  IMnemoChartDateOptions,
  IMnemoChartRequestOptions,
  IMnemoChartViewOptions, IMnemoSubModel,
} from '../../../../../models';
import { MnemoServiceAbstract } from '../../../../pure-modules';
import { ActiveShapesFormulaService } from './active-shapes-formula.service';
import { ActiveShapesOmService } from './active-shapes-om.service';
import { ActiveShapesRawService } from './active-shapes-raw.service';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesTagService } from './active-shapes-tag.service';
import { ActiveShapesValueService } from './active-shapes-value.service';
import { ActiveShapesService } from './active-shapes.service';

@Injectable()
export class ActiveShapesWrapperService implements IMnemoSubModel, OnDestroy {
  private readonly dates$ = inject<StoreObservable<IDatesInterval>>(DATES_GLOBAL$);
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesValueService = inject(ActiveShapesValueService);
  private readonly activeShapesTagService = inject(ActiveShapesTagService);
  private readonly activeShapesOmService = inject(ActiveShapesOmService);
  private readonly activeShapesFormulaService = inject(ActiveShapesFormulaService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly activeShapesRawService = inject(ActiveShapesRawService);

  public subscriptions: Subscription[] = [];
  public item: IDashboardItem | null = null;

  public get requestOptions(): IMnemoChartRequestOptions {
    return this.item?.requestOptions;
  }

  public set requestOptions(v: IMnemoChartRequestOptions) {
    this.item.requestOptions = v;
  }

  public get viewOptions(): IMnemoChartViewOptions {
    return this.item?.viewOptions;
  }

  public set viewOptions(v: IMnemoChartViewOptions) {
    this.item.viewOptions = v;
  }

  public ngOnDestroy(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public initSubscribe(): void {
    if (this.item?.requestOptions?.realtimeRefresh === false) {
      this.activeShapesService.fixedPointsRealtimeValuesMap.set(this.item.id, false);
    } else {
      this.activeShapesService.fixedPointsRealtimeValuesMap.set(this.item.id, true);
    }

    this.activeShapesValueService.getActiveShapesSourceItems([this.item], false);
    this.requestOptions = this.item?.requestOptions;
    this.viewOptions = this.item?.viewOptions;

    if (this.requestOptions?.date) {
      this.requestOptions.realtimeRefresh = false;
      this.reDraw();
    }
    const dateSub$ = this.dates$.pipe(filter(() => !this.requestOptions?.date)).subscribe((d) => {
      this.drawByDate(d);
    });
    this.subscriptions.push(dateSub$);
  }

  public reDraw(): void {
    if (!this.requestOptions) {
      this.drawByDate(this.dates$.getValue());
      return;
    }
    if (this.requestOptions?.realtimeRefresh === false) {
      this.activeShapesService.currentTime = 'period';
      this.toggleUpdate(false);
    } else {
      this.activeShapesService.currentTime = 'day';
      this.toggleUpdate(true);
    }
    this.drawByRequestOptions();
  }

  private drawByRequestOptions(
    date: IMnemoChartDateOptions = this.getDefaultDate(this.requestOptions.hoursPeriod)
  ): void {
    this.activeShapesRealtimeService.cleanData();
    this.activeShapesTagService.getHistoryData(
      new Date(this.requestOptions?.date?.start ?? date.start),
      new Date(this.requestOptions?.date?.end ?? date?.end),
      this.requestOptions?.scale,
      this.requestOptions?.intervalsCount
    );
    this.activeShapesOmService.getHistoryData(
      new Date(this.requestOptions?.date?.start ?? date.start),
      new Date(this.requestOptions?.date?.end ?? date.end)
    );
    this.activeShapesFormulaService.getHistoryData();

    this.item?.options?.data?.forEach((mappingOptions) => {
      if (mappingOptions.sourceType === 'raw') {
        this.activeShapesRawService.getRawQuery(
          mappingOptions,
          this.item.id,
          this.item.viewElementType,
          this.item.options.view,
          this.requestOptions
        );
      }
    });
  }

  private drawByDate(d: IDatesInterval): void {
    this.activeShapesRealtimeService.cleanData();
    let date: IMnemoChartDateOptions = null;
    if (d?.fromDateTime) {
      this.activeShapesService.currentTime = 'period';
      date = { start: d.fromDateTime, end: d.toDateTime };
      this.toggleUpdate(false);
    } else {
      this.activeShapesService.currentTime = 'day';
      date = this.getDefaultDate(this.requestOptions?.hoursPeriod);
      this.toggleUpdate(this.requestOptions?.realtimeRefresh ?? true);
    }

    this.activeShapesTagService.getHistoryData(
      date.start,
      date.end,
      this.requestOptions?.scale,
      this.requestOptions?.intervalsCount
    );
    this.activeShapesOmService.getHistoryData(date.start, date.end);
    this.activeShapesFormulaService.getHistoryData();
    this.item?.options?.data?.forEach((mappingOptions) => {
      if (mappingOptions.sourceType === 'raw') {
        this.activeShapesRawService.getRawQuery(
          mappingOptions,
          this.item.id,
          this.item.viewElementType,
          this.item.options.view,
          null
        );
      }
    });
  }

  private getDefaultDate(hoursPeriod?: number): IMnemoChartDateOptions {
    return {
      start: new Date(
        new Date().setHours(new Date().getHours() - (hoursPeriod ?? MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod))
      ),
      end: new Date(),
    };
  }

  private toggleUpdate(val: boolean): void {
    this.activeShapesTagService.updateEnabled = val;
    this.activeShapesOmService.updateEnabled = val;
    this.activeShapesFormulaService.updateEnabled = val;
  }
}
