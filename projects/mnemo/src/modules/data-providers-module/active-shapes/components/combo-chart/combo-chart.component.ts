/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-plusplus */
import { AsyncPipe, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges, inject } from '@angular/core';
import { DecorateUntilDestroy, LANGUAGE, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import {
  ITluiChartSingleLayerInputModel,
  TLUI_CHART_FORM_CREATE_SERVICE,
  TluiChartComboModule,
  TluiChartFormCreateService,
  tluiChartNumberMock1,
  tluiChartNumberMock2,
  TluiChartReSizeEvent,
} from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, delay, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  ComboChartComboKeyType,
  DataItemTypeEnum,
  IComboChartComboData,
  IComboChartRenderingOptions,
  IDashboardItemOptions,
  IDashboardRealTimeData,
  IDataMappingOptionsViewer,
} from '../../../../../models';
import {
  ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_REALTIME_DATA,
} from '../../active-shapes.tokens';
import { ACTIVE_SHAPES_COMBO_CHART_OPTIONS, ACTIVE_SHAPES_DATA_MAPPING_OPTIONS } from '../../consts';
import { ActiveShapesRawExtractorService } from '../../services';
import { ActiveShapesShapesSetsChartService } from '../../services';

const CHART_COMBO_KEYS: ComboChartComboKeyType[] = Array.from([
  DataItemTypeEnum.ComboBar,
  DataItemTypeEnum.ComboBarHorizontal,
  DataItemTypeEnum.StackBar,
  DataItemTypeEnum.StackBarHorizontal,
]);

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-combo-chart',
  templateUrl: './combo-chart.component.html',
  styleUrls: ['./combo-chart.component.scss'],
  imports: [NgForOf, NgIf, AsyncPipe, TluiChartComboModule, NgTemplateOutlet],
  providers: [ActiveShapesShapesSetsChartService, ActiveShapesRawExtractorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeComboChartComponent implements OnInit, OnChanges {
  public language$ = inject<Observable<'ru' | 'en' | 'fa'>>(LANGUAGE);
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  private readonly formCreateService = inject<TluiChartFormCreateService>(TLUI_CHART_FORM_CREATE_SERVICE);
  public options = inject<IDashboardItemOptions>(ACTIVE_SHAPES_ITEM_OPTIONS);
  public id = inject(ACTIVE_SHAPES_ITEM_ID);
  public realTimeData$ = inject<Observable<IDashboardRealTimeData>>(ACTIVE_SHAPES_REALTIME_DATA, { optional: true });
  public fixedPointsRealtimeData$ = inject<Observable<Map<string, boolean>>>(
    ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
    { optional: true }
  );
  public pointsRealtimeValue$ = inject<Observable<Map<string, number>>>(ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA, {
    optional: true,
  });
  public setterService = inject(ActiveShapesShapesSetsChartService);
  public rawExtractor = inject(ActiveShapesRawExtractorService);

  private fixedPointsRealtimeData: boolean = false;
  private pointsRealtimeData: number | null = null;
  private chartOptionsString: string = '';
  private readonly chartOptions$$ = new BehaviorSubject<IComboChartRenderingOptions>(null);
  public chartOptions$ = this.chartOptions$$.asObservable().pipe(delay(0));
  public typeOptions = DataItemTypeEnum;

  @Input() public size: TluiChartReSizeEvent;
  public customResize$: BehaviorSubject<TluiChartReSizeEvent | null> = new BehaviorSubject<TluiChartReSizeEvent | null>(
    null
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
          t.type === DataItemTypeEnum.Bar ||
          t.type === DataItemTypeEnum.BarHorizontal
      );

      const comboData = this.setterService.createComboData(CHART_COMBO_KEYS);
      CHART_COMBO_KEYS.forEach((key) => {
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

      CHART_COMBO_KEYS.forEach((key) => {
        this.setterService.combineData(comboData[key]);
      });

      this.setOptions(this.options.view as ITluiChartSingleLayerInputModel, data, comboData);
    } else {
      const viewOptions$ = this.store.getState$<ITluiChartSingleLayerInputModel>(ACTIVE_SHAPES_COMBO_CHART_OPTIONS);
      const dataOptions$ = this.store.getState$<IDataMappingOptionsViewer[]>(ACTIVE_SHAPES_DATA_MAPPING_OPTIONS).pipe(
        map((d) => {
          const data: IDataMappingOptionsViewer[] = [];
          const comboData = this.setterService.createComboData(CHART_COMBO_KEYS);

          if (d?.length) {
            d.forEach((c, i) => {
              switch (c.type) {
                case DataItemTypeEnum.Line:
                case DataItemTypeEnum.Area:
                case DataItemTypeEnum.GradientArea:
                  c.chartData = tluiChartNumberMock1.map((val) => [val[0], val[1] * +`${1}.${i}`]);
                  data.push(c);
                  break;
                case DataItemTypeEnum.Bar:
                case DataItemTypeEnum.BarHorizontal:
                  c.chartData = tluiChartNumberMock2.map((val) => [val[0], Math.round(val[1] * Math.random())]);
                  data.push(c);
                  break;
                case DataItemTypeEnum.ComboBar:
                case DataItemTypeEnum.ComboBarHorizontal:
                case DataItemTypeEnum.StackBar:
                case DataItemTypeEnum.StackBarHorizontal:
                  c.chartData = tluiChartNumberMock2.map((val) => [val[0], Math.round(val[1] * Math.random())]);
                  comboData[c.type] = this.setterService.setData(comboData[c.type], c);
                  break;
                default:
                  break;
              }
            });
          }

          CHART_COMBO_KEYS.forEach((key) => {
            this.setterService.combineData(comboData[key]);
          });

          return [data, comboData];
        })
      );

      combineLatest([viewOptions$, dataOptions$])
        .pipe(takeUntilDestroyed(this))
        .subscribe(([viewOptions, dataOptions]) =>
          this.setOptions(
            viewOptions,
            dataOptions[0] as IDataMappingOptionsViewer[],
            dataOptions[1] as IComboChartComboData
          )
        );
    }

    this.realTimeData$?.pipe(takeUntilDestroyed(this)).subscribe((res: IDashboardRealTimeData) => {
      const existData = this.chartOptions$$.value;
      existData.data = existData.data.filter((item) => item.sourceType !== 'raw');
      this.setterService.setDataRealtime(existData, res, this.fixedPointsRealtimeData, this.pointsRealtimeData);
      CHART_COMBO_KEYS.forEach((key) => {
        if (existData.comboData?.[key]) {
          this.setterService.refreshField(existData, key);
          this.setterService.setComboDataRealtime(
            existData.comboData,
            res,
            this.fixedPointsRealtimeData,
            key,
            this.pointsRealtimeData
          );
        }
      });

      let comboCounter = 0;
      let comboHorizontalCounter = 0;
      let stackCounter = 0;
      let stackHorizontalCounter = 0;
      const rawData = this.rawExtractor.extractRawData(this.id, res.raw, res.orderMap.get(this.id));

      rawData?.forEach((item) => {
        switch (item.type) {
          case DataItemTypeEnum.Line:
          case DataItemTypeEnum.Area:
          case DataItemTypeEnum.GradientArea:
          case DataItemTypeEnum.Bar:
          case DataItemTypeEnum.BarHorizontal:
            existData.data.push(item);
            break;
          case DataItemTypeEnum.ComboBar:
            this.setterService.setDataRaw(existData.comboData.comboBar, item, comboCounter);
            comboCounter++;
            break;
          case DataItemTypeEnum.ComboBarHorizontal:
            this.setterService.setDataRaw(existData.comboData.comboBarHorizontal, item, comboHorizontalCounter);
            comboHorizontalCounter++;
            break;
          case DataItemTypeEnum.StackBar:
            this.setterService.setDataRaw(existData.comboData.stackBar, item, stackCounter);
            stackCounter++;
            break;
          case DataItemTypeEnum.StackBarHorizontal:
            this.setterService.setDataRaw(existData.comboData.stackBarHorizontal, item, stackHorizontalCounter);
            stackHorizontalCounter++;
            break;
          default:
            break;
        }
      });

      CHART_COMBO_KEYS.forEach((key) => {
        this.setterService.combineData(existData.comboData[key]);
      });

      this.setOptions(existData.view, existData.data, existData.comboData);
    });
  }

  private setOptions(
    view: IComboChartRenderingOptions['view'],
    data: IComboChartRenderingOptions['data'],
    comboData: IComboChartRenderingOptions['comboData']
  ): void {
    const options: IComboChartRenderingOptions = {
      view: this.formCreateService.createFormObjects(view),
      data,
      comboData,
    };
    const optionsString = JSON.stringify(options);
    if (this.chartOptionsString !== optionsString) {
      this.chartOptionsString = optionsString;
      this.chartOptions$$.next(null);
      this.chartOptions$$.next(options);
    }
  }
}
