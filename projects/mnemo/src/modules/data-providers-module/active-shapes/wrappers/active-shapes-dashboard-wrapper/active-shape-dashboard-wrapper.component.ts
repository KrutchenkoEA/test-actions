/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { provideTranslocoScope } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { GridsterItemComponent } from 'angular-gridster2';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BehaviorSubject } from 'rxjs';
import { MnemoScopeLoader } from '../../../../../assets';
import {
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
import { ActiveShapesRealtimeService, ActiveShapesService, ActiveShapesWrapperService } from '../../services';
import { ActiveShapesWrapperDirective } from '../active-shapes-wrapper.directive';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-active-shapes-dashboard-wrapper',
  standalone: true,
  imports: [NgComponentOutlet, FnPipe, ViewerCoreModule, AsyncPipe, NgxSkeletonLoaderModule, GridsterItemComponent],
  templateUrl: './active-shape-dashboard-wrapper.component.html',
  styleUrl: './active-shape-dashboard-wrapper.component.scss',
  providers: [
    ...ActiveShapesProviders,
    ...ViewerCorePrivatServices,
    provideTranslocoScope({
      scope: 'mnemo',
      loader: MnemoScopeLoader,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeDashboardWrapperComponent extends ActiveShapesWrapperDirective implements OnInit {
  public injector = inject(Injector);
  private readonly popupService = inject(PopupService);
  private readonly activeShapesWrapperService = inject(ActiveShapesWrapperService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService, { optional: true });
  public activeShapesService = inject(ActiveShapesService, { optional: true });

  @Input() public item: IDashboardItem | null = null;

  @Input() public isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.activeShapesWrapperService.item = this.item;
    if (this.item) {
      this.activeShapesWrapperService.initSubscribe();
    }
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
