/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-plusplus */
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DecorateUntilDestroy, LANGUAGE, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { TluiChartComboModule, TluiChartReSizeEvent, TluiLineChartModule } from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, delay, map, Observable } from 'rxjs';
import {
  ComboChartComboKeyType,
  DataItemTypeEnum,
  IDashboardItemOptions,
  IDashboardRealTimeData,
  IDataMappingOptions,
  IMultiLineChartOptions,
  IMultiLineChartRenderingOptions,
} from '../../../../../models';
import {
  ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_REALTIME_DATA,
} from '../../active-shapes.tokens';
import {
  ACTIVE_SHAPES_DATA_MAPPING_OPTIONS,
  ACTIVE_SHAPES_MULTI_LINE_CHART_OPTIONS,
  MOCK_1,
  MOCK_3,
} from '../../consts';
import { ActiveShapesRawExtractorService, ActiveShapesShapesSetsChartService } from '../../services';

const MULTILINE_CHART_KEYS: ComboChartComboKeyType[] = Array.from([
  DataItemTypeEnum.StackBar,
  DataItemTypeEnum.FullStackBar,
]);

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-multi-line-chart',
  templateUrl: './multi-line-chart.component.html',
  styleUrls: ['./multi-line-chart.component.scss'],
  imports: [TluiLineChartModule, NgForOf, NgIf, CommonModule, TluiChartComboModule],
  providers: [ActiveShapesShapesSetsChartService, ActiveShapesRawExtractorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**  @deprecated todo remove */
export class ActiveShapeMultiLineChartComponent implements OnInit, OnChanges {
  public language$ = inject<Observable<'ru' | 'en' | 'fa'>>(LANGUAGE);
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  public options = inject<IDashboardItemOptions>(ACTIVE_SHAPES_ITEM_OPTIONS);
  public id = inject(ACTIVE_SHAPES_ITEM_ID);
  public realTimeData$ = inject<Observable<IDashboardRealTimeData>>(ACTIVE_SHAPES_REALTIME_DATA, { optional: true });
  public fixedPointsRealtimeData$ = inject<Observable<Map<string, boolean>>>(
    ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
    { optional: true },
  );
  public pointsRealtimeValue$ = inject<Observable<Map<string, number>>>(ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA, {
    optional: true,
  });
  public setterService = inject(ActiveShapesShapesSetsChartService);
  public rawExtractor = inject(ActiveShapesRawExtractorService);

  private fixedPointsRealtimeData: boolean = false;
  private pointsRealtimeData: number | null = null;
  private chartOptionsString: string = '';
  private readonly chartOptions$$ = new BehaviorSubject<IMultiLineChartRenderingOptions>(null);
  public chartOptions$ = this.chartOptions$$.asObservable().pipe(delay(0));
  public typeOptions = DataItemTypeEnum;
  public mockData = MOCK_1;

  @Input() public size: TluiChartReSizeEvent;
  public customResize$: BehaviorSubject<TluiChartReSizeEvent | null> = new BehaviorSubject<TluiChartReSizeEvent | null>(
    null,
  );

  public ngOnChanges({ size }: SimpleChanges): void {
    if (!size.isFirstChange()) {
      this.customResize$.next(size.currentValue);
    }
  }

  public ngOnInit(): void {
    this.pointsRealtimeValue$?.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      this.pointsRealtimeData = v.get(this.id);
    });

    this.fixedPointsRealtimeData$?.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      this.fixedPointsRealtimeData = v.get(this.id);
    });

    if (!this.options.exampleView) {
      const data = this.options?.data?.filter(
        (t) =>
          t.type === DataItemTypeEnum.Line ||
          t.type === DataItemTypeEnum.Area ||
          t.type === DataItemTypeEnum.GradientArea ||
          t.type === DataItemTypeEnum.Bar,
      );

      const comboData = this.setterService.createComboData(MULTILINE_CHART_KEYS);
      MULTILINE_CHART_KEYS.forEach((key) => {
        this.options?.data
          ?.filter((t) => t.type === key)
          ?.forEach((c) => {
            if (c.sourceType === 'raw') {
              comboData[key] = this.setterService.setDataRaw(comboData[key], c);
            } else {
              comboData[key] = this.setterService.setData(comboData[key], c);
            }
          });
      });

      MULTILINE_CHART_KEYS.forEach((key) => {
        this.setterService.combineData(comboData[key], true);
      });

      this.setOptions(this.options.view as IMultiLineChartOptions, data, comboData);
    } else {
      const viewOptions$ = this.store.getState$<IMultiLineChartOptions>(ACTIVE_SHAPES_MULTI_LINE_CHART_OPTIONS);
      const dataOptions$ = this.store.getState$<IDataMappingOptions[]>(ACTIVE_SHAPES_DATA_MAPPING_OPTIONS).pipe(
        map((d) => {
          const data: IDataMappingOptions[] = [];
          const comboData = this.setterService.createComboData(MULTILINE_CHART_KEYS);

          if (d?.length) {
            d.forEach((c, i) => {
              switch (c.type) {
                case DataItemTypeEnum.Line:
                case DataItemTypeEnum.Area:
                case DataItemTypeEnum.GradientArea:
                  c.chartData = MOCK_1.map((it) => [it[0], it[1] * +`${1}.${i}`]);
                  data.push(c);
                  break;
                case DataItemTypeEnum.Bar:
                  c.chartData = MOCK_3.map((val) => [val[0], Math.round(val[1] * Math.random())]);
                  data.push(c);
                  break;
                case DataItemTypeEnum.StackBar:
                case DataItemTypeEnum.FullStackBar:
                  c.chartData = MOCK_3.map((val) => [val[0], Math.round(val[1] * Math.random())]);
                  comboData[c.type] = this.setterService.setData(comboData[c.type], c);
                  break;
                default:
                  break;
              }
            });
          }

          MULTILINE_CHART_KEYS.forEach((key) => {
            this.setterService.combineData(comboData[key], true);
          });

          return [data, comboData];
        }),
      );

      combineLatest([viewOptions$, dataOptions$])
        .pipe(takeUntilDestroyed(this))
        .subscribe(([viewOptions, dataOptions]) =>
          this.setOptions(
            viewOptions,
            dataOptions[0] as IDataMappingOptions[],
            dataOptions[1] as IMultiLineChartRenderingOptions['comboData'],
          ),
        );
    }

    this.realTimeData$?.pipe(takeUntilDestroyed(this)).subscribe((res: IDashboardRealTimeData) => {
      const existData = this.chartOptions$$.value;
      existData.data = existData.data.filter((item) => item.sourceType !== 'raw');
      this.setterService.setDataRealtime(existData, res, this.fixedPointsRealtimeData, this.pointsRealtimeData);

      MULTILINE_CHART_KEYS.forEach((key) => {
        if (existData.comboData?.[key]) {
          this.setterService.refreshField(existData, key);
          this.setterService.setComboDataRealtime(
            existData.comboData,
            res,
            this.fixedPointsRealtimeData,
            key,
            this.pointsRealtimeData,
          );
        }
      });

      let stackCounter = 0;
      let fullStackCounter = 0;
      const rawData = this.rawExtractor.extractRawData(this.id, res.raw, res.orderMap.get(this.id));

      rawData?.forEach((item) => {
        switch (item.type) {
          case DataItemTypeEnum.Line:
          case DataItemTypeEnum.Area:
          case DataItemTypeEnum.GradientArea:
          case DataItemTypeEnum.Bar:
            existData.data.push(item);
            break;
          case DataItemTypeEnum.StackBar:
            this.setterService.setDataRaw(existData.comboData.stackBar, item, stackCounter);
            stackCounter++;
            break;
          case DataItemTypeEnum.FullStackBar:
            this.setterService.setDataRaw(existData.comboData.fullStackBar, item, fullStackCounter);
            fullStackCounter++;
            break;
          default:
            break;
        }
      });

      MULTILINE_CHART_KEYS.forEach((key) => {
        this.setterService.combineData(existData.comboData[key], true);
      });

      this.setOptions(existData.view, existData.data, existData.comboData);
    });
  }

  private setOptions(
    view: IMultiLineChartRenderingOptions['view'],
    data: IMultiLineChartRenderingOptions['data'],
    comboData: IMultiLineChartRenderingOptions['comboData'],
  ): void {
    const options: IMultiLineChartRenderingOptions = { view, data, comboData };

    const optionsString = JSON.stringify(options);
    if (this.chartOptionsString !== optionsString) {
      this.chartOptionsString = optionsString;
      this.chartOptions$$.next(null);
      this.chartOptions$$.next(options);
    }
  }
}
