/* eslint-disable import/no-extraneous-dependencies */
import { CdkContextMenuTrigger } from '@angular/cdk/menu';
import { AsyncPipe, NgComponentOutlet, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective } from '@jsverse/transloco';
import {
  DATES_GLOBAL$,
  DecorateUntilDestroy,
  IDatesInterval,
  STORE_GLOBAL,
  StoreObservable,
  StoreService,
  takeUntilDestroyed,
} from '@tl-platform/core';
import { TluiSpinnerModule } from '@tl-platform/ui';
import { CompactType, GridsterComponent, GridsterConfig, GridsterItemComponent, GridType } from 'angular-gridster2';
import { SvgIconComponent } from 'angular-svg-icon';
import { saveAs } from 'file-saver';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { filter, Observable } from 'rxjs';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS } from '../../../consts';
import {
  IDashboardItem,
  IDashboardItemOptions,
  IDataMappingOptions,
  IMnemoChartDateOptions,
  IMnemoChartRequestSettingModel,
  ViewElementTypeEnum,
} from '../../../models';
import { FnPipe } from '../../../pipes';
import { MnemoFormCreateService, PopupService } from '../../../services';
import { MnemoRequestSettingPopupComponent, ViewerRefreshService, ViewerService } from '../../pure-modules';
import {
  ACTIVE_SHAPES_BASE_URL,
  ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_REALTIME_DATA,
  ActiveShapeDashboardWrapperComponent,
  ActiveShapesFormulaService,
  ActiveShapesOmService,
  ActiveShapesProviders,
  ActiveShapesRawService,
  ActiveShapesRealtimeService,
  ActiveShapesService,
  ActiveShapesTagService,
  ActiveShapesValueService,
  ActiveShapesWrapperDirective,
  VIEWER_DASHBOARD_SELECTED_ITEM,
  VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED,
} from '../active-shapes';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-dashboard',
  templateUrl: './viewer-dashboard.component.html',
  styleUrls: ['./viewer-dashboard.component.scss'],
  providers: [PopupService, MnemoFormCreateService, ...ActiveShapesProviders],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    GridsterComponent,
    NgIf,
    TranslocoDirective,
    AsyncPipe,
    TluiSpinnerModule,
    GridsterItemComponent,
    MatTooltip,
    SvgIconComponent,
    ActiveShapeDashboardWrapperComponent,
    CdkContextMenuTrigger,
    NgComponentOutlet,
    FnPipe,
    NgxSkeletonLoaderModule,
  ],
})
export class ViewerDashboardComponent extends ActiveShapesWrapperDirective implements OnInit, OnDestroy {
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  private readonly dates$ = inject<StoreObservable<IDatesInterval>>(DATES_GLOBAL$);
  public override injector = inject(Injector);
  private readonly viewerService = inject(ViewerService);
  public activeShapesRawService = inject(ActiveShapesRawService);
  public activeShapesTagService = inject(ActiveShapesTagService);
  public activeShapesOmService = inject(ActiveShapesOmService);
  public activeShapesFormulaService = inject(ActiveShapesFormulaService);
  public activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  public activeShapesService = inject(ActiveShapesService);
  public activeShapesValueService = inject(ActiveShapesValueService);
  private readonly viewerRefreshService = inject(ViewerRefreshService);
  private readonly popupService = inject(PopupService);
  private readonly cdr = inject(ChangeDetectorRef);

  public isLoading$: Observable<boolean>;
  public options: GridsterConfig;

  public _data: Array<IDashboardItem> = [];

  @Input()
  public set data(d: IDashboardItem[]) {
    if (!d) return;
    this.activeShapesValueService.getActiveShapesSourceItems(d, true);
    this._data = d;
  }

  @Input()
  public set reSizeWorkArea(v: [number, number]) {
    this.options?.api.resize();
  }

  @ViewChildren(ActiveShapeDashboardWrapperComponent)
  public wrapperComponents: QueryList<ActiveShapeDashboardWrapperComponent>;

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.viewerService.isViewerInit$.next(true);
    this.isLoading$ = this.viewerService.isViewerInit$;

    this.options = {
      margin: 0,
      gridType: GridType.Fit,
      compactType: CompactType.None,
      maxCols: 10,
      maxRows: 10,
      pushItems: false,
      itemResizeCallback: this.resizeGridsterElement.bind(this),
      draggable: {
        enabled: false,
      },
      resizable: {
        enabled: false,
      },
    };

    this.dates$.pipe(takeUntilDestroyed(this)).subscribe((d) => {
      this.activeShapesRealtimeService.cleanData();

      if (d?.fromDateTime) {
        this.viewerRefreshService.stopUpdate();
        this.activeShapesService.currentTime = 'period';
        this.activeShapesTagService.getHistoryData(d.fromDateTime, d.toDateTime);
        this.activeShapesOmService.getHistoryData(d.fromDateTime, d.toDateTime);
        this.activeShapesFormulaService.getHistoryData();
      } else {
        const date = this.getDefaultDate();
        this.activeShapesTagService.getHistoryData(date.start, date.end);
        this.activeShapesOmService.getHistoryData(date.start, date.end);
        this.activeShapesFormulaService.getHistoryData();
        setTimeout(() => {
          this.viewerRefreshService.startUpdate();
          this.activeShapesService.currentTime = 'day';
        });
      }

      this._data.forEach((chart: IDashboardItem) => {
        chart.options?.data?.forEach((item: IDataMappingOptions) => {
          if (item.sourceType === 'raw') {
            this.activeShapesRawService.getRawQuery(item, chart.id, chart.viewElementType, chart.options.view);
          }
        });
      });
    });

    this.viewerService.toolbarButtonEmit$.pipe(takeUntilDestroyed(this)).subscribe((type) => {
      switch (type) {
        case 'save':
          this.onClickSave();
          break;
        default:
          break;
      }
    });

    this.store
      .getState$<IDashboardItem>(VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED)
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((d) => {
        d.options?.data?.forEach((item: IDataMappingOptions) => {
          if (item.sourceType === 'raw') {
            this.activeShapesRealtimeService.rawDataMap.set(item.name, null);
            this.activeShapesRawService.getRawQuery(item, d.id, d.viewElementType, d.options.view);
          }
          if (item.sourceType === 'tag') {
            // todo
          }
          if (item.sourceType === 'omAttr') {
            // todo
          }
          if (item.sourceType === 'formula') {
            // todo
          }
        });
      });
  }

  public ngOnDestroy(): void {
    this.store.setState<null>(VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED, null);
    this.store.setState<null>(VIEWER_DASHBOARD_SELECTED_ITEM, null);
    this.store.setState<string>(ACTIVE_SHAPES_BASE_URL, null);
  }

  public override getInjector = (id: string, options: IDashboardItemOptions): Injector => {
    return Injector.create({
      providers: [
        {
          provide: ACTIVE_SHAPES_ITEM_ID,
          useValue: id,
        },
        {
          provide: ACTIVE_SHAPES_ITEM_OPTIONS,
          useValue: options,
        },
        {
          provide: ACTIVE_SHAPES_REALTIME_DATA,
          useValue: this.activeShapesRealtimeService?.realTimeData$?.asObservable(),
        },
        {
          provide: ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
          useValue:
            options.type === ViewElementTypeEnum.PieChart
              ? null
              : this.activeShapesRealtimeService?.fixedPointsRealtimeValuesMap$?.asObservable(),
        },
        {
          provide: ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA,
          useValue:
            options.type === ViewElementTypeEnum.PieChart
              ? null
              : this.activeShapesRealtimeService?.pointsRealtimeValuesMap$?.asObservable(),
        },
      ],
      parent: this.injector,
    });
  };

  public openSourceSettings($event: MouseEvent | TouchEvent, item: IDashboardItem): void {
    $event.preventDefault();
    $event.stopPropagation();
    this.store.setState<null>(VIEWER_DASHBOARD_SELECTED_ITEM, null);
    setTimeout(() => this.store.setState<IDashboardItem>(VIEWER_DASHBOARD_SELECTED_ITEM, item));
  }

  public openRequestSetting($event: MouseEvent | TouchEvent, item: IDashboardItem): void {
    $event.preventDefault();
    $event.stopPropagation();

    if (item?.requestOptions) {
      this.openRequestSettingsPopup(item);
      return;
    }
    const element = this.wrapperComponents.find((component) => component.item.id === item.id);
    this.openRequestSettingsPopup(item, element);
  }

  public openRequestSettingsPopup(item: IDashboardItem, element?: ActiveShapeDashboardWrapperComponent): void {
    if (element) {
      element.openSettingPopup();
      return;
    }
    const data = {
      requestOptions: item?.requestOptions,
      viewOptions: item?.viewOptions,
    };

    this.popupService
      .open(MnemoRequestSettingPopupComponent, data as IMnemoChartRequestSettingModel)
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((res: IMnemoChartRequestSettingModel) => {
        if (!res) return;
        item.requestOptions = res?.requestOptions;
        item.viewOptions = res?.viewOptions;
        this.activeShapesService.pointsRealtimeValuesMap.set(item.id, res?.requestOptions?.points ?? 0);
        if (!res?.requestOptions || res?.requestOptions?.fixedPoints) {
          this.activeShapesService.fixedPointsRealtimeValuesMap.set(item.id, true);
        } else {
          this.activeShapesService.fixedPointsRealtimeValuesMap.set(item.id, false);
        }
        this.activeShapesRealtimeService.pointsRealtimeValuesMap$.next(
          this.activeShapesService.pointsRealtimeValuesMap
        );
        this.activeShapesRealtimeService.fixedPointsRealtimeValuesMap$.next(
          this.activeShapesService.fixedPointsRealtimeValuesMap
        );
        this.cdr.markForCheck();
      });
  }

  private readonly resizeGridsterElement = (): void => {
    setTimeout(() => document.dispatchEvent(new Event('resize')), 300);
  };

  private onClickSave(): void {
    if (!this._data) return;
    const dataForSave = this._data.slice(0);
    dataForSave.map((g) =>
      g.options.data.forEach((t) => {
        t.chartData = [];
      })
    );

    const filename = `${
      this.viewerService.selectedNodeName$.value
        ? this.viewerService.selectedNodeName$.value
        : `dashboard${new Date().toLocaleString()}`
    }.json`;
    const file: File = this.activeShapesService.getJsonFile(this._data, filename);
    saveAs(file, filename);
  }

  private getDefaultDate(): IMnemoChartDateOptions {
    return {
      start: new Date(new Date().setHours(new Date().getHours() - MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod)),
      end: new Date(),
    };
  }
}
