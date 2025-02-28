/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-destructuring */
import { AsyncPipe, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { DecorateUntilDestroy, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { TluiLottieAnimationModule } from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, debounceTime, delay, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import {
  DataItemTypeEnum,
  IActiveShapeRawRowTableType,
  IActiveShapeTableDataDefault,
  IActiveShapeTableOptions,
  IActiveShapeTableRenderingOptions,
  IDashboardItemOptions,
  IDashboardRealTimeData,
  IDashboardTableChartData,
  IDataMappingOptionsViewer,
} from '../../../../../models';
import {
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_REALTIME_DATA,
} from '../../active-shapes.tokens';
import {
  ACTIVE_SHAPES_DATA_MAPPING_OPTIONS,
  ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_OPTIONS,
} from '../../consts';
import { ActiveShapesRawExtractorService } from '../../services';
import { ActiveShapeTableItemComponent } from './table-item/table-item.component';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  imports: [
    NgForOf,
    NgIf,
    AsyncPipe,
    TranslocoModule,
    TluiLottieAnimationModule,
    NgTemplateOutlet,
    ActiveShapeTableItemComponent,
  ],
  providers: [ActiveShapesRawExtractorService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeTableComponent implements OnInit {
  public options = inject<IDashboardItemOptions>(ACTIVE_SHAPES_ITEM_OPTIONS);
  public id = inject(ACTIVE_SHAPES_ITEM_ID);
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  public realTimeData$ = inject<Observable<IDashboardRealTimeData>>(ACTIVE_SHAPES_REALTIME_DATA, { optional: true });
  public rawExtractor = inject(ActiveShapesRawExtractorService);

  private chartOptionsString: string = '';
  private readonly chartOptions$$ = new BehaviorSubject<IActiveShapeTableRenderingOptions>(null);
  public chartOptions$ = this.chartOptions$$.asObservable().pipe(delay(0));
  public customKeys: string[] = [];

  @Input() public size: { width: number; height: number };

  public ngOnInit(): void {
    if (!this.options.view) {
      this.options.view = {
        table: ACTIVE_SHAPES_TABLE_DEFAULT_VALUE,
        header: ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE,
        body: ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE,
        keyName: ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE,
      };
    }

    if (!this.options.exampleView) {
      let tableData: IDataMappingOptionsViewer = null;
      this.options.data?.forEach((c) => {
        tableData = this.setData(tableData, c);
      });
      this.setCustomKeys(this.options.view as IActiveShapeTableOptions);
      this.setKeys(tableData, null);
      this.setOptions(this.options.view as IActiveShapeTableOptions, tableData, []);
    } else {
      const viewOptions$ = this.store.getState$<IActiveShapeTableOptions>(ACTIVE_SHAPES_TABLE_OPTIONS).pipe(
        map((v) => {
          this.setCustomKeys(v);
          return v;
        }),
      );
      const dataOptions$ = this.store.getState$<IDataMappingOptionsViewer[]>(ACTIVE_SHAPES_DATA_MAPPING_OPTIONS).pipe(
        filter((x) => !!x),
        debounceTime(300),
        map((d) => {
          let tableData: IDataMappingOptionsViewer = null;
          d?.forEach((c) => {
            tableData = this.setData(tableData, c);
          });
          this.setKeys(tableData, null);
          return tableData;
        }),
      );

      combineLatest([viewOptions$, dataOptions$])
        .pipe(takeUntilDestroyed(this))
        .subscribe((options) => this.setOptions(options[0], options[1], []));
    }

    this.realTimeData$?.pipe(takeUntilDestroyed(this)).subscribe((res) => {
      const existData = this.chartOptions$$.value;

      existData.data.tableData.data = existData.data.tableData.data.filter(
        (item) => !!item?.sourceType && item.sourceType !== 'raw',
      );
      this.setDataRealtime(res);

      const rawData: IDataMappingOptionsViewer[] = [];
      const orderMap = res.orderMap.get(this.id);
      const rawDataExtracted = this.rawExtractor.extractRawData(this.id, res.raw, orderMap);
      rawDataExtracted?.forEach((rd) => {
        const tableDataRaw: IDataMappingOptionsViewer = this.setDataRaw(rd);
        this.setKeys(tableDataRaw, orderMap);
        rawData.push(tableDataRaw);
      });

      this.setOptions(existData.view, existData.data, rawData);
    });
  }

  private setKeys(tableData: IDataMappingOptionsViewer, orderMap: Map<string, number> | null): void {
    const keys: string[] = [];
    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in tableData.tableBody[0]) {
      if (key !== 'lastRow') {
        keys.push(key);
      }
    }

    if (orderMap?.size) {
      keys.sort((a, b) => {
        return orderMap.get(a) >= orderMap.get(b) ? 1 : -1;
      });
    }
    tableData.tableData = {
      displayedColumns: Array.from(new Set([...keys, ...this.customKeys])),
      data: tableData.tableBody,
    } as unknown as IDashboardTableChartData;
  }

  private setCustomKeys(view: IActiveShapeTableOptions): void {
    if (view?.keyNameCustom) {
      this.customKeys = Object.keys(view.keyNameCustom) ?? [];
    }
  }

  private setData(data: IDataMappingOptionsViewer | null, item: IDataMappingOptionsViewer): IDataMappingOptionsViewer {
    if (!data) {
      data = {
        name: '',
        sourceType: null,
        sourceData: null,
        type: item.type,
        tableBody: [this.buildData(item)],
        dataNameTypeRecord: { [item.name]: item.sourceType },
        dataNameGuidRecord: { [item.name]: item?.sourceData?.attrGuid },
      };
    } else {
      data.tableBody.push(this.buildData(item) as unknown as IActiveShapeTableDataDefault);
      data.dataNameTypeRecord[item.name] = item.sourceType;
      data.dataNameGuidRecord[item.name] = item?.sourceData?.attrGuid;
    }

    return data;
  }

  private setDataRaw(data: IDataMappingOptionsViewer): IDataMappingOptionsViewer {
    return {
      name: '',
      sourceType: null,
      sourceData: null,
      type: DataItemTypeEnum.Null,
      tableBody: this.buildDataRaw(data),
    };
  }

  private buildData(data: IDataMappingOptionsViewer): IActiveShapeTableDataDefault {
    if (data.sourceType === 'raw') {
      return {
        color: data.color,
        name: data.name,
        id: null,
        sourceType: data.sourceType,
        time: new Date().toLocaleString(),
        value: null,
      };
    }
    if (data.sourceType === 'tag') {
      return {
        color: data.color,
        name: data.name,
        id: data.sourceData.tagId,
        sourceType: data.sourceType,
        time: new Date().toLocaleString(),
        value: null,
      };
    }
    if (data.sourceType === 'omAttr') {
      return {
        color: data.color,
        name: data.name,
        id: data.sourceData.attrGuid,
        sourceType: data.sourceType,
        time: new Date().toLocaleString(),
        value: null,
      };
    }
    if (data.sourceType === 'formula') {
      /* empty */
    } else {
      return {
        color: data.color,
        name: data.name,
        id: null,
        sourceType: null,
        time: new Date().toLocaleString(),
        value: null,
      };
    }
    return null;
  }

  private buildDataRaw(
    data: IDataMappingOptionsViewer,
  ): (IActiveShapeTableDataDefault | IActiveShapeRawRowTableType)[] {
    return data.tableBody.map((v, i) => {
      v.color = data.palette[i];
      return v;
    });
  }

  private setDataRealtime(realTimeData: IDashboardRealTimeData): void {
    const existData = this.chartOptions$$.value;
    (existData?.data?.tableBody as IActiveShapeTableDataDefault[])?.forEach((d) => {
      let data = [];

      if (d.sourceType === 'tag') {
        data = realTimeData.tag.get(d.name);
      }
      if (d.sourceType === 'omAttr') {
        data = realTimeData.omAttr.get(d.id as string);
      }
      if (d.sourceType === 'formula') {
        data = [];
      }

      const dataLength = data?.length;
      if (dataLength) {
        d.time = new Date(data[dataLength - 1][0]).toLocaleString();
        d.value = data[dataLength - 1][1];
      } else {
        d.time = null;
        d.value = null;
      }
    });
  }

  private setOptions(
    view: IActiveShapeTableOptions,
    data: IDataMappingOptionsViewer,
    rawData: IDataMappingOptionsViewer[],
  ): void {
    const options: IActiveShapeTableRenderingOptions = {
      view,
      data,
      rawData,
    };
    const optionsString = JSON.stringify(options);
    if (this.chartOptionsString !== optionsString) {
      this.chartOptionsString = optionsString;
      this.chartOptions$$.next(null);
      this.chartOptions$$.next(options);
    }
  }
}
