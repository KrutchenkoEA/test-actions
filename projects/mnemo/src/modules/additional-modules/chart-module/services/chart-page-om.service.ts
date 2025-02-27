/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, debounceTime, forkJoin } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import {
  IOMAttribute,
  IOMAttributeData,
  IOMAttributeValues,
  IOmObjectChart,
  IVCDataOptions,
  IVCLineData,
} from '../../../../models';
import { MnemoLoggerService, RtdbOmApiService } from '../../../../services';
import { PlayerModeService, ViewerMapperService, ViewerOMService } from '../../../pure-modules';
import { ChartColorService } from './chart-color.service';
import { ChartPageAbstractClass } from './chart-page-abstract.class';
import { ChartWrapService } from './chart-wrap.service';
import { ChartService } from './chart.service';
import { TluiLCLineInputData } from '@tl-platform/ui';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartPageOmService implements ChartPageAbstractClass {
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);

  public dataMap = new Map<string, TluiLCLineInputData[]>();

  public chartData: IVCLineData[] = [];
  public chartData$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);
  public chartDataUpdate$: BehaviorSubject<IVCLineData[]> = new BehaviorSubject<IVCLineData[]>([]);

  public selectedItems: IOmObjectChart[] = [];
  public isChartDataDownloading: boolean = false;
  public isGroupLineStyle: boolean = false;

  public initSubscribe(isGroupLineStyle: boolean, isUpdateEnable: boolean = true): void {
    this.isGroupLineStyle = isGroupLineStyle;
    this.chartWrapService.chartPageData$
      .pipe(debounceTime(500), takeUntil(this.chartWrapService.chartWrapDestroy$))
      .subscribe((opt) => {
        if (!(opt && opt?.omAttributes?.length)) {
          return;
        }
        this.setOptions(opt);
      });

    this.chartWrapService.chartWrapOmAttr$.pipe(takeUntil(this.chartWrapService.chartWrapDestroy$)).subscribe((opt) => {
      if (!(opt && opt?.omAttribute)) {
        return;
      }
      this.getSingleData(opt);
    });

    if (isUpdateEnable) {
      this.playerModeService.isPlayerMode$.pipe(takeUntil(this.chartWrapService.chartWrapDestroy$)).subscribe(() => {
        this.isChartDataDownloading = true;
        this.chartData = [];
        this.dataMap.clear();
        this.nextTrigger();
      });

      this.viewerOMService.updateOmData$
        .pipe(
          filter(() => !this.isChartDataDownloading),
          takeUntil(this.chartWrapService.chartWrapDestroy$)
        )
        .subscribe(() => {
          if (!this.selectedItems.length) {
            return;
          }
          this.updateData();
        });
    }
  }

  public setOptions(options: IVCDataOptions): void {
    this.selectedItems = options.omAttributes;
    this.chartWrapService.chartWrapLoading$.next(true);
    this.isChartDataDownloading = true;
    this.dataMap.clear();

    const customTrend: IVCDataOptions[] = [];

    options.omAttributes.forEach((attr) => {
      const customOpt = this.chartService.getLineOptions(
        this.chartWrapService.chartId,
        attr.attrGuid,
        this.isGroupLineStyle
      )?.req;
      const opt: IVCDataOptions = {
        omAttribute: attr,
        date: customOpt
          ? {
              start: customOpt?.date?.start,
              end: customOpt?.date?.end,
            }
          : {
              start: options.date?.start,
              end: options.date?.end,
            },
        isExistData: false,
      };
      customTrend.push(opt);
    });
    this.getData(customTrend);
  }

  public getData(
    customTrend: IVCDataOptions[],
    defaultTrend?: IVCDataOptions,
    isExistData: boolean = false,
    isUpdate: boolean = false
  ): void {
    forkJoin(
      customTrend?.map((attr) => {
        return this.rtdbOmApiService.getOMAttributes(
          attr.omAttribute.attrParentGuid,
          [attr.omAttribute.attrGuid],
          attr.date?.start?.toISOString(),
          attr.date?.end?.toISOString()
        );
      })
    )
      .pipe(
        map((attrs) => {
          return attrs.map((attr) => [attr.data[0], this.sortData(attrs[0], 1, isExistData)]);
        }),
        map((attrs: [IOMAttributeData, boolean][]) => {
          if (attrs && attrs?.length) {
            attrs.forEach((attr) => {
              this.mapDataForChart(attr[0]);
            });
          }
          return attrs;
        }),
        map((attrs: [IOMAttributeData, boolean][]) => {
          if (attrs.length !== this.selectedItems?.length) {
            this.selectedItems.forEach((t) => {
              const attr = attrs?.find((tag) => tag[0]?.attributeId === t.attrGuid);
              if (!attr) {
                this.dataMap.set(t.attrGuid, []);
                this.mapDataForChart({ attributeId: t.attrGuid, name: t.attrName });
              }
            });
          }

          return attrs;
        }),
        takeUntil(this.chartWrapService.chartWrapDestroy$)
      )
      .subscribe({
        next: () => this.nextTrigger(isUpdate),
        error: (e) => this.errorTrigger(e),
      });
  }

  public getSingleData(opt: IVCDataOptions): void {
    const customOpt = this.chartService.getLineOptions(
      this.chartWrapService.chartId,
      opt.omAttribute.attrGuid,
      this.isGroupLineStyle
    )?.req;

    if (!this.selectedItems.find((item) => item.attrGuid === opt.omAttribute.attrGuid)) {
      this.selectedItems.push(opt.omAttribute);
    }

    this.chartWrapService.chartWrapLoading$.next(true);

    this.isChartDataDownloading = true;

    this.rtdbOmApiService
      .getOMAttributes(
        opt.omAttribute.attrParentGuid,
        [opt.omAttribute.attrGuid],
        customOpt.date?.start?.toISOString(),
        customOpt.date?.end?.toISOString()
      )
      .pipe(
        map((attr) => {
          return [attr.data[0], this.sortData(attr[0], customOpt.exponent, false)];
        }),
        map((attr: [IOMAttributeData, boolean]) => {
          if (attr && attr?.length) {
            this.mapDataForChart(attr[0]);
          }
          return [attr];
        }),
        takeUntil(this.chartWrapService.chartWrapDestroy$)
      )
      .subscribe({
        next: () => this.nextTrigger(),
        error: (e) => this.errorTrigger(e),
      });
  }

  public updateData(): void {
    const customTrend: IVCDataOptions[] = this.selectedItems.map((attr) => {
      const attrData = this.dataMap.get(attr.attrGuid);
      const lastDate = attrData?.[attrData.length - 1]?.[0] as Date;
      return {
        omAttribute: attr,
        date: {
          start: lastDate || new Date(new Date().setSeconds(new Date().getSeconds() - 30)),
          end: new Date(),
        },
      };
    });

    this.getData(customTrend, null, true, true);
  }

  public drawTagByPlayer(attrs: IOMAttributeValues[]): void {
    this.selectedItems.forEach((attr) => {
      const attrData = attrs.find((t) => t.attributeId === attr.attrGuid);
      if (attrData?.value) {
        this.isChartDataDownloading = false;
        let index = -1;
        if (this.chartData.find((t) => t.name === attr.name)) {
          index = this.chartData.findIndex((d) => d.name === attr.name);
        }
        if (index === -1) {
          this.chartData.push({
            name: attr.name,
            id: attr.attrGuid,
            data: [this.viewerMapperService.prepareOmAttrDataMapRest(attrData)],
            color: this.chartColorService.getColor(
              this.selectedItems.findIndex((d) => d.attrName === attr.name),
              2
            ),
          });
        } else {
          this.chartData[index].data = [
            ...this.chartData[index].data,
            this.viewerMapperService.prepareOmAttrDataMapRest(attrData),
          ];
        }
      }
    });
    this.nextTrigger(true);
  }

  public sortData(attr: IOMAttribute, exponent: number = 1, isExistData: boolean = false): boolean {
    let existData: TluiLCLineInputData[] = [];

    if (isExistData) {
      existData = this.dataMap.get(attr.data[0]?.attributeId) ?? [];
    }

    const value: TluiLCLineInputData[] = [];
    const data = attr?.data[0]?.values;
    if (!(data && data?.length)) {
      return false;
    }
    data.reverse().forEach((d) => value.push(this.viewerMapperService.prepareOmAttrDataMapRest(d, exponent)));
    this.dataMap.set(attr.data[0]?.attributeId, [...existData, ...value]);
    return true;
  }

  public mapDataForChart(attr: { name: string; attributeId: string }): void {
    const attrData = this.dataMap.get(attr.attributeId);
    if (!attrData) {
      return;
    }

    let index = -1;
    if (this.chartData.find((d) => d.name === attr.name)) {
      index = this.chartData.findIndex((d) => d.name === attr.name);
    }
    if (index === -1) {
      this.chartData.push({
        name: attr.name,
        id: attr.attributeId,
        data: attrData,
        color: this.chartColorService.getColor(
          this.selectedItems.findIndex((d) => d.attrName === attr.name),
          2
        ),
      });
    } else {
      this.chartData[index].data = attrData;
    }
  }

  public clear(): void {
    this.chartData = [];
    this.selectedItems = [];
    this.dataMap.clear();
    this.chartWrapService.chartWrapLoading$.next(false);
    this.chartData$.next([]);
  }

  public nextTrigger(isUpdate: boolean = false): void {
    this.isChartDataDownloading = false;
    if (isUpdate) {
      this.chartDataUpdate$.next(this.chartData);
    } else {
      this.chartData$.next(this.chartData);
    }
  }

  public errorTrigger(e: unknown): void {
    this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    this.isChartDataDownloading = false;
    this.chartWrapService.chartWrapLoading$.next(false);
  }
}
