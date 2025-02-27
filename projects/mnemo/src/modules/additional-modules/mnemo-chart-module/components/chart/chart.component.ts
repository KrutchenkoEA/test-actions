/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed } from '@tl-platform/core';
import { TluiChartLineDataSimple } from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, debounceTime, Observable } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  IMnemoChartDrawData,
  IMnemoChartLineData,
  IMnemoChartLineDrawData,
  IMnemoChartObject,
} from '../../../../../models';
import { PopupService } from '../../../../../services';
import { PlayerModeService, ViewerService } from '../../../../pure-modules';
import {
  MnemoChartFormulaService,
  MnemoChartOmService,
  MnemoChartService,
  MnemoChartTagsService,
  MnemoChartWrapService,
} from '../../services';
import { MnemoChartPrintComponent } from '../chart-print/chart-print.component';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-2',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartComponent implements OnInit, OnDestroy {
  private readonly document = inject<Document>(DOCUMENT);
  public language$ = inject<Observable<'ru' | 'en' | 'fa'>>(LANGUAGE);
  public viewerService = inject(ViewerService);
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  private readonly mnemoChartService = inject(MnemoChartService);
  private readonly mnemoChartTagsService = inject(MnemoChartTagsService);
  private readonly mnemoChartOmService = inject(MnemoChartOmService);
  private readonly mnemoChartFormulaService = inject(MnemoChartFormulaService);
  private readonly elementRef = inject(ElementRef);
  private readonly popupService = inject(PopupService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly cdr = inject(ChangeDetectorRef);

  public updaterMap: Map<string, BehaviorSubject<TluiChartLineDataSimple[]>> = new Map<
    string,
    BehaviorSubject<TluiChartLineDataSimple[]>
  >();

  public ngOnInit(): void {
    this.mnemoChartTagsService.initSubscribe();
    this.mnemoChartOmService.initSubscribe();
    this.mnemoChartFormulaService.initSubscribe();

    this.mnemoChartWrapService.chartWrapData$
      .pipe(debounceTime(500), takeUntil(this.mnemoChartWrapService.chartWrapDestroy$))
      .subscribe(() => this.cdr.markForCheck());

    this.playerModeService.isPlayerMode$.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      this.dataCreator([]);
      if (!v) {
        this.mnemoChartWrapService.chartWrapData$.next(this.mnemoChartWrapService.chartWrapData$.value);
      }
    });

    this.mnemoChartWrapService.printEmit$
      .pipe(takeUntil(this.mnemoChartWrapService.chartWrapDestroy$))
      .subscribe(() => this.printChart());

    combineLatest([
      this.mnemoChartTagsService.chartData$,
      this.mnemoChartOmService.chartData$,
      this.mnemoChartFormulaService.chartData$,
    ])
      .pipe(
        debounceTime(2000),
        map((charts) => {
          const newArr: IMnemoChartLineDrawData[] = [];
          charts?.forEach((ch, index) => {
            if (ch?.length) {
              if (index === 0) {
                newArr.push({ data: ch, type: 'tag' });
              } else if (index === 1) {
                newArr.push({ data: ch, type: 'omAttr' });
              } else {
                newArr.push({ data: ch, type: 'formula' });
              }
            }
          });
          return newArr;
        }),
        takeUntilDestroyed(this)
      )
      .subscribe((charts) => this.dataCreator(charts));

    this.mnemoChartWrapService.chartWrapClear$.pipe(takeUntilDestroyed(this)).subscribe(() => {
      this.mnemoChartTagsService.clear();
      this.mnemoChartOmService.clear();
      this.mnemoChartFormulaService.clear();

      this.mnemoChartWrapService.chartDrawData$.next(null);
      this.mnemoChartWrapService.chartWrapLoading$.next(false);
      this.cdr.markForCheck();
    });

    combineLatest([
      this.mnemoChartTagsService.chartDataUpdate$,
      this.mnemoChartOmService.chartDataUpdate$,
      this.mnemoChartFormulaService.chartDataUpdate$,
    ])
      .pipe(debounceTime(2000), takeUntilDestroyed(this))
      .subscribe((charts) => this.dataUpdater(charts));
  }

  public ngOnDestroy(): void {
    this.updaterMap.clear();
    this.mnemoChartWrapService.chartWrapDestroy$.next(null);
    this.mnemoChartTagsService.destroy();
    this.mnemoChartOmService.destroy();
    this.mnemoChartFormulaService.destroy();
  }

  public dataCreator(charts: IMnemoChartLineDrawData[]): void {
    if (!charts.length) {
      this.mnemoChartWrapService.chartDrawData$.next(null);
    }

    const chartSetting = this.mnemoChartService.getChartOptions(this.mnemoChartWrapService.chartId);
    const viewSetting = this.mnemoChartService.getViewOptions(this.mnemoChartWrapService.chartId);

    const options: IMnemoChartDrawData = {
      view: chartSetting,
      data: [],
      additionalLayers: [],
    };

    const createChartObject = (
      trendData: IMnemoChartLineData,
      dataUpdate$: BehaviorSubject<TluiChartLineDataSimple[]>,
      isAxisVisible: boolean = false
    ): IMnemoChartObject => {
      return {
        name: trendData.name,
        color: trendData.color,
        opacity: 1,
        dataUpdate$,
        customView: this.mnemoChartService.getTrendOptions(this.mnemoChartWrapService.chartId, trendData.name),
        isAxisVisible,
      };
    };

    charts.forEach((chartData) => {
      chartData?.data?.forEach((trendData, index) => {
        const dataUpdate$ = new BehaviorSubject(trendData.data);
        this.updaterMap.set(trendData.name, dataUpdate$);

        if (options?.data?.length && viewSetting?.autoZoom) {
          options.additionalLayers.push({
            view: chartSetting,
            data: [createChartObject(trendData, dataUpdate$, viewSetting?.autoZoomAxisActiveState?.[`xy${index}`])],
          });
        } else {
          options.data.push(createChartObject(trendData, dataUpdate$, true));
          const isAxisVisible: boolean = viewSetting?.autoZoomAxisActiveState?.[`xy${index}`];
          if (isAxisVisible !== null || isAxisVisible !== undefined) {
            options.view.axisX.drawAxis = isAxisVisible;
            options.view.axisY.drawAxis = isAxisVisible;
            options.view.gridX.drawGrid = isAxisVisible;
            options.view.gridY.drawGrid = isAxisVisible;
          }
        }
      });
    });

    this.mnemoChartWrapService.chartDrawData$.next(options);
    this.mnemoChartWrapService.chartWrapLoading$.next(false);
  }

  public dataUpdater(charts: [IMnemoChartLineData[], IMnemoChartLineData[], IMnemoChartLineData[]]): void {
    charts?.forEach((chart) => {
      chart?.forEach((ch) => {
        const dataUpdate$ = this.updaterMap.get(ch.name);
        if (dataUpdate$) {
          dataUpdate$.next(ch.data);
        }
      });
    });
  }

  private printChart(): void {
    const ref = this.popupService.open(
      MnemoChartPrintComponent,
      {
        html: this.elementRef.nativeElement.innerHTML,
      },
      {
        width: this.document.defaultView.innerWidth,
        height: this.document.defaultView.innerHeight,
        positions: [
          {
            originX: 'center',
            originY: 'center',
            overlayX: 'center',
            overlayY: 'center',
          },
        ],
        hasBackdrop: true,
        panelClass: 'tl-mnemo-popover-background',
      }
    );

    ref.popupRef.afterClosed().subscribe();
    window.print();
    ref.popupRef.close(ref);
  }
}
