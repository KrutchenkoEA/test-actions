/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-destructuring */
import { CommonModule, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { DecorateUntilDestroy, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { TluiChartModule } from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, debounceTime, delay, map, Observable } from 'rxjs';
import { DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES } from '../../../../../consts';
import {
  IDashboardItemOptions,
  IDashboardRealTimeData,
  IDataMappingOptionsViewer,
  IPieChartData,
  IPieChartOptions,
  IPieChartRenderingOptions,
} from '../../../../../models';
import {
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_REALTIME_DATA,
} from '../../active-shapes.tokens';
import {
  ACTIVE_SHAPES_DATA_MAPPING_OPTIONS,
  ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE,
  ACTIVE_SHAPES_PIE_CHART_OPTIONS,
} from '../../consts';
import { ActiveShapesRawExtractorService } from '../../services';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss'],
  imports: [TluiChartModule, NgIf, CommonModule],
  providers: [ActiveShapesRawExtractorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapePieChartComponent implements OnInit {
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  public options = inject<IDashboardItemOptions>(ACTIVE_SHAPES_ITEM_OPTIONS);
  public id = inject(ACTIVE_SHAPES_ITEM_ID);
  public realTimeData$ = inject<Observable<IDashboardRealTimeData>>(ACTIVE_SHAPES_REALTIME_DATA, { optional: true });
  public rawExtractor = inject(ActiveShapesRawExtractorService);

  private chartOptionsString: string = '';
  private readonly chartOptions$$ = new BehaviorSubject<IPieChartRenderingOptions>(null);
  public chartOptions$ = this.chartOptions$$.asObservable().pipe(delay(0));

  @Input()
  public size: { width: number; height: number } = {
    width: DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES.width,
    height: DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES.height,
  };

  public ngOnInit(): void {
    if (!this.options.view) {
      this.options.view = ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE;
    }

    if (!this.options.exampleView) {
      let pieData: IDataMappingOptionsViewer = null;
      this.options.data?.forEach((c) => {
        pieData = this.setData(pieData, c);
      });

      this.setOptions(this.options.view as IPieChartOptions, pieData);
    } else {
      const viewOptions$ = this.store
        .getState$<IPieChartOptions>(ACTIVE_SHAPES_PIE_CHART_OPTIONS)
        .pipe(debounceTime(300));

      const dataOptions$ = this.store.getState$<IDataMappingOptionsViewer[]>(ACTIVE_SHAPES_DATA_MAPPING_OPTIONS).pipe(
        debounceTime(300),
        map((d): IDataMappingOptionsViewer => {
          let pieData: IDataMappingOptionsViewer = null;
          d?.forEach((c) => {
            pieData = this.setData(pieData, c);
          });

          const data: Partial<IDataMappingOptionsViewer> = {
            chartData: [],
          };

          if (d?.length) {
            d.forEach((c) => {
              data.chartData.push({
                color: c.color,
                value: 10,
                title: c.name,
              });
            });
          }

          return data as IDataMappingOptionsViewer;
        }),
      );

      combineLatest([viewOptions$, dataOptions$])
        .pipe(takeUntilDestroyed(this))
        .subscribe(([viewOptions, dataOptions]) => this.setOptions(viewOptions, dataOptions));
    }

    this.realTimeData$?.pipe(takeUntilDestroyed(this)).subscribe((res: IDashboardRealTimeData) => {
      const existData = this.chartOptions$$.value;
      existData.data.chartData = existData.data.chartData.filter(
        (item: IDataMappingOptionsViewer) => !!item?.sourceType && item.sourceType !== 'raw',
      );
      this.setDataRealtime(res);

      const rawData = this.rawExtractor.extractRawData(this.id, res.raw, res.orderMap.get(this.id));
      rawData?.forEach((rd) => existData.data.chartData.push(...this.buildDataRaw(rd)));

      this.setOptions(existData.view, existData.data);
    });
  }

  public getPosition(containerPosition: 'top' | 'center' | 'bottom'): string {
    switch (containerPosition) {
      case 'top':
        return 'flex-start';
      case 'center':
        return 'center';
      case 'bottom':
        return 'flex-end';
      default:
        return 'center';
    }
  }

  private setData(data: IDataMappingOptionsViewer | null, item: IDataMappingOptionsViewer): IDataMappingOptionsViewer {
    if (!data) {
      data = {
        name: '',
        sourceType: null,
        sourceData: null,
        type: item.type,
        chartData: [this.buildData(item)],
        dataNameTypeRecord: { [item.name]: item.sourceType },
        dataNameGuidRecord: { [item.name]: item?.sourceData?.attrGuid },
      };
    } else {
      data.chartData.push(this.buildData(item));
      data.dataNameTypeRecord[item.name] = item.sourceType;
      data.dataNameGuidRecord[item.name] = item?.sourceData?.attrGuid;
    }

    return data;
  }

  private buildData(data: IDataMappingOptionsViewer): IPieChartData {
    if (data.sourceType === 'raw') {
      return {
        color: data.color,
        value: 10,
        title: data.name,
        sourceType: data.sourceType,
      };
    }
    if (data.sourceType === 'tag') {
      return {
        color: data.color,
        value: 10,
        title: data.sourceData.tagName,
        sourceType: data.sourceType,
      };
    }
    if (data.sourceType === 'omAttr') {
      return {
        color: data.color,
        value: 10,
        title: data.name,
        sourceType: data.sourceType,
        attrGuid: data.sourceData.attrGuid,
      };
    }
    if (data.sourceType === 'formula') {
      /* empty */
    } else {
      return {
        color: data.color,
        value: 10,
        title: data.name,
        sourceType: null,
      };
    }
    return null;
  }

  private buildDataRaw(data: IDataMappingOptionsViewer): IPieChartData[] {
    return data?.chartData?.map((item) => {
      return {
        color: item.color,
        value: item.value,
        title: item.title,
        sourceType: 'raw',
      };
    });
  }

  private setDataRealtime(realTimeData: IDashboardRealTimeData): void {
    const existData = this.chartOptions$$.value;
    (existData?.data?.chartData as IPieChartData[])?.forEach((d) => {
      let data = [];

      if (d.sourceType === 'tag') {
        data = realTimeData.tag.get(d.title);
      }
      if (d.sourceType === 'omAttr') {
        data = realTimeData.omAttr.get(d.attrGuid);
      }
      if (d.sourceType === 'formula') {
        data = [];
      }

      const dataLength = data?.length;
      if (dataLength) {
        d.value = data[dataLength - 1][1];
      } else {
        d.value = 0;
      }
    });
  }

  private setOptions(view: IPieChartOptions, data: IDataMappingOptionsViewer): void {
    const options: IPieChartRenderingOptions = {
      view,
      data,
    };
    const optionsString = JSON.stringify(options);
    if (this.chartOptionsString !== optionsString) {
      this.chartOptionsString = optionsString;
      this.chartOptions$$.next(null);
      this.chartOptions$$.next(options);
    }
  }
}
