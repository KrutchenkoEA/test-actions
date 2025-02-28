/* eslint-disable import/no-extraneous-dependencies */
import { CdkContextMenuTrigger, CdkMenu } from '@angular/cdk/menu';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { provideTranslocoScope, TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { TluiChartComboModule } from '@tl-platform/ui';
import { GridsterItemComponent } from 'angular-gridster2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BehaviorSubject } from 'rxjs';
import { MnemoScopeLoader } from '../../../../../assets';
import {
  DataItemTypeEnum,
  IDashboardItem,
  IDashboardItemOptions,
  IMnemoChartRequestSettingModel,
  ViewElementTypeEnum,
} from '../../../../../models';
import { FnPipe } from '../../../../../pipes';
import { PopupService } from '../../../../../services';
import {
  MnemoRequestSettingPopupComponent,
  ViewerCoreModule,
  ViewerCorePrivatServices,
} from '../../../../pure-modules';
import { ActiveShapesProviders } from '../../active-shapes.providers';
import {
  ACTIVE_SHAPES_FIXED_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_ITEM_ID,
  ACTIVE_SHAPES_ITEM_OPTIONS,
  ACTIVE_SHAPES_POINTS_COUNT_REALTIME_DATA,
  ACTIVE_SHAPES_REALTIME_DATA,
} from '../../active-shapes.tokens';
import {
  ActiveShapesDataCreatorService,
  ActiveShapesRealtimeService,
  ActiveShapesService,
  ActiveShapesWrapperService,
} from '../../services';
import { ActiveShapesWrapperAbstract } from '../active-shapes-wrapper.abstract';
import { ActiveShapesWrapperDirective } from '../active-shapes-wrapper.directive';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-active-shapes-mnemo-wrapper',
  standalone: true,
  imports: [
    NgComponentOutlet,
    TluiChartComboModule,
    FnPipe,
    ViewerCoreModule,
    AsyncPipe,
    NgxSkeletonLoaderModule,
    GridsterItemComponent,
    CdkContextMenuTrigger,
    CdkMenu,
    TranslocoDirective,
    TranslocoPipe,
  ],
  templateUrl: './active-shapes-mnemo-wrapper.component.html',
  styleUrl: './active-shapes-mnemo-wrapper.component.scss',
  providers: [
    ...ActiveShapesProviders,
    ...ViewerCorePrivatServices,
    ActiveShapesDataCreatorService,
    provideTranslocoScope({
      scope: 'mnemo',
      loader: MnemoScopeLoader,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapesMnemoWrapperComponent
  extends ActiveShapesWrapperDirective
  implements OnInit, ActiveShapesWrapperAbstract
{
  public injector = inject(Injector);
  private readonly popupService = inject(PopupService);
  private readonly activeShapesDataCreatorService = inject(ActiveShapesDataCreatorService);
  private readonly activeShapesWrapperService = inject(ActiveShapesWrapperService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService, { optional: true });
  public activeShapesService = inject(ActiveShapesService, { optional: true });

  @Input() public item: IDashboardItem | null = null;

  @Input()
  public size: { width: number; height: number } = { width: 400, height: 200 };

  @Input() public viewType: ViewElementTypeEnum;
  @Input() public dataType: DataItemTypeEnum;

  @Input() public exampleView: boolean = false;

  @Input() public isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    if (this.item) {
      this.activeShapesWrapperService.item = this.item;

      if (!this.exampleView) {
        this.activeShapesWrapperService.initSubscribe();
      }
      return;
    }
    this.item = this.activeShapesDataCreatorService.createDashboardObject(this.viewType, this.dataType);
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

  public openSettingPopup(): void {
    const data = {
      requestOptions: this.activeShapesWrapperService?.item?.requestOptions,
      viewOptions: this.activeShapesWrapperService?.item?.viewOptions,
    };

    this.popupService
      .open(MnemoRequestSettingPopupComponent, data as IMnemoChartRequestSettingModel)
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((res: IMnemoChartRequestSettingModel) => {
        if (!res) return;
        if (res?.requestOptions?.date?.start && res?.requestOptions?.date?.end) {
          // @ts-ignore
          res.options.date.start = new Date(res.options.date.start).toISOString();
          // @ts-ignore
          res.options.date.end = new Date(res.options.date.end).toISOString();
        }
        this.activeShapesWrapperService.requestOptions = res?.requestOptions;
        this.activeShapesWrapperService.viewOptions = res?.viewOptions;
        this.activeShapesService.pointsRealtimeValuesMap.set(
          this.activeShapesWrapperService?.item.id,
          res?.requestOptions?.points ?? 0
        );
        if (!res?.requestOptions || res?.requestOptions?.fixedPoints) {
          this.activeShapesService.fixedPointsRealtimeValuesMap.set(this.activeShapesWrapperService.item.id, true);
        } else {
          this.activeShapesService.fixedPointsRealtimeValuesMap.set(this.activeShapesWrapperService.item.id, false);
        }
        this.activeShapesRealtimeService.pointsRealtimeValuesMap$.next(
          this.activeShapesService.pointsRealtimeValuesMap
        );
        this.activeShapesRealtimeService.fixedPointsRealtimeValuesMap$.next(
          this.activeShapesService.fixedPointsRealtimeValuesMap
        );
        this.activeShapesWrapperService.reDraw();
      });
  }
}
