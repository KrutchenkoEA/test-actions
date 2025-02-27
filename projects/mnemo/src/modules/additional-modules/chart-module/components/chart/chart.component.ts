/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed, ThemeConfiguratorService } from '@tl-platform/core';
import { TLUI_LC_COLORS_LIST, TluiLCLineInputData } from '@tl-platform/ui';
import { BehaviorSubject, combineLatest, debounceTime, Observable, skip, throttleTime } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {
  IOMAttributeValues,
  ITagsValues,
  IVCDrawData,
  IVCLayer,
  IVCLayerDataLine,
  IVCLineData,
  IViewerChartModels,
  SourceType,
} from '../../../../../models';
import { PopupService } from '../../../../../services';
import {
  PlayerModeService,
  ViewerFormulaService,
  ViewerMapperService,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../../../pure-modules';
import { MNEMO_CHARTS_COLORS_LIST } from '../../consts';
import {
  ChartOptionsService,
  ChartPageFormulaService,
  ChartPageOmService,
  ChartPageTagsService,
  ChartService,
  ChartWrapService,
} from '../../services';
import { ChartPrintComponent } from '../chart-print/chart-print.component';

/**  @deprecated use MnemoChartModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TLUI_LC_COLORS_LIST, useValue: MNEMO_CHARTS_COLORS_LIST }],
})
export class ChartComponent implements OnInit, OnDestroy {
  private readonly document = inject<Document>(DOCUMENT);
  readonly language$ = inject<Observable<'ru' | 'en' | 'fa'>>(LANGUAGE);
  private readonly chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);
  public viewerService = inject(ViewerService);
  private readonly cPTagsService = inject(ChartPageTagsService);
  private readonly cPOmService = inject(ChartPageOmService);
  private readonly cPFormulaService = inject(ChartPageFormulaService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly viewerMapperService = inject(ViewerMapperService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly chartOptionsService = inject(ChartOptionsService);
  private readonly elementRef = inject(ElementRef);
  private readonly themeService = inject(ThemeConfiguratorService);
  private readonly popupService = inject(PopupService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() public isGroupLineStyle: boolean = false;
  @Input() public isUpdateEnable: boolean = true;

  public isEmpty$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public updaterMap: Map<string, BehaviorSubject<TluiLCLineInputData[]>> = new Map<
    string,
    BehaviorSubject<TluiLCLineInputData[]>
  >();

  public ngOnInit(): void {
    this.cPTagsService.initSubscribe(this.isGroupLineStyle, this.isUpdateEnable);
    this.cPOmService.initSubscribe(this.isGroupLineStyle, this.isUpdateEnable);
    this.cPFormulaService.initSubscribe(this.isGroupLineStyle, this.isUpdateEnable);

    this.chartWrapService.chartPageData$
      .pipe(debounceTime(500), takeUntil(this.chartWrapService.chartWrapDestroy$))
      .subscribe(() => this.cdr.markForCheck());

    this.chartWrapService.printEmit$
      .pipe(takeUntil(this.chartWrapService.chartWrapDestroy$))
      .subscribe(() => this.printChart());

    combineLatest([this.cPTagsService.chartData$, this.cPOmService.chartData$, this.cPFormulaService.chartData$])
      .pipe(
        debounceTime(2000),
        map((charts) => {
          const newArr: IVCDrawData[] = [];
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

    this.chartWrapService.chartWrapClear$.pipe(takeUntilDestroyed(this)).subscribe(() => {
      this.cPTagsService.clear();
      this.cPOmService.clear();
      this.cPFormulaService.clear();

      this.chartWrapService.chartPageDrawData$.next(null);
      this.chartWrapService.chartWrapLoading$.next(false);
      this.cdr.markForCheck();
    });

    this.themeService.isDarkTheme.pipe(skip(1), takeUntilDestroyed(this)).subscribe((v) => {
      this.chartService.refreshColors(v);
      this.chartWrapService.chartWrapLoading$.next(true);
      setTimeout(() => this.chartWrapService.chartWrapLoading$.next(false));
    });

    if (this.isUpdateEnable) {
      this.playerModeService.isPlayerMode$.pipe(takeUntilDestroyed(this)).subscribe(() => this.dataCreator([]));

      combineLatest([
        this.cPTagsService.chartDataUpdate$,
        this.cPOmService.chartDataUpdate$,
        this.cPFormulaService.chartDataUpdate$,
      ])
        .pipe(debounceTime(2000), takeUntilDestroyed(this))
        .subscribe((charts) => this.dataUpdater(charts));

      combineLatest([
        this.viewerTagService.updateTagDataPlayer$,
        this.viewerOMService.updateOmDataPlayer$,
        this.viewerFormulaService.updateFormulaDataPlayer$,
      ])
        .pipe(throttleTime(1000), takeUntil(this.chartWrapService.chartWrapDestroy$))
        .subscribe((charts) => this.dataPlayerUpdater(charts));
    }
  }

  public ngOnDestroy(): void {
    this.updaterMap.clear();
    this.chartWrapService.chartWrapDestroy$.next(null);
  }

  public dataCreator(charts: IVCDrawData[]): void {
    if (charts?.length) {
      const layers: IVCLayer[] = [];
      const separateLayers: IVCLayer[] = [];
      const setSeparateLayers = (type: SourceType | string, line: IVCLayerDataLine): void => {
        separateLayers.push({
          layerName: type,
          layerTitle: type,
          layerViewOptions:
            this.chartService.layerOptions.get(`${this.chartWrapService.chartId}-${type}`) ??
            this.chartOptionsService.getDefaultLayerOptions(),
          layerDrawOptions: {
            line: [line],
          },
        });
      };

      charts.forEach((c, i) => {
        const lines: IVCLayerDataLine[] = [];

        c.data?.forEach((v) => {
          const style =
            this.chartService.getLineOptions(this.chartWrapService.chartId, v.id, this.isGroupLineStyle)?.view ??
            this.chartService.lineDefaultOptions;
          const dataUpdate$ = new BehaviorSubject(v.data);
          this.updaterMap.set(v.name, dataUpdate$);

          const lineData = {
            layerDataViewOptions: { ...style, caption: v.name, lineColor: v.color },
            layerDataDrawOptions: { data: v.data, dataUpdate$ },
          };

          if (style?.separateLayer) {
            setSeparateLayers(v.name, lineData);
          } else {
            lines.push(lineData);
          }
        });

        layers.push({
          layerName: c.type,
          layerTitle: c.type,
          layerViewOptions:
            this.chartService.layerOptions.get(`${this.chartWrapService.chartId}-${c.type}`) ??
            this.chartOptionsService.getDefaultLayerOptions(i),
          layerDrawOptions: {
            line: lines,
          },
        });
      });

      const data: IViewerChartModels = {
        chartId: this.chartWrapService.chartId,
        viewOptions:
          this.chartService.chartOptions.get(this.chartWrapService.chartId) ??
          this.chartOptionsService.getDefaultChartOptions(),
        layers: [...layers, ...separateLayers],
      };
      this.chartWrapService.chartPageDrawData$.next(data);
    } else {
      this.chartWrapService.chartPageDrawData$.next(null);
    }
    this.chartWrapService.chartWrapLoading$.next(false);
  }

  public dataUpdater(charts: [IVCLineData[], IVCLineData[], IVCLineData[]]): void {
    charts?.forEach((chart) => {
      chart?.forEach((ch) => {
        const dataUpdate$ = this.updaterMap.get(ch.name);
        if (dataUpdate$) {
          dataUpdate$.next(ch.data);
        }
      });
    });
  }

  public dataPlayerUpdater(charts: [ITagsValues[], IOMAttributeValues[], unknown[]]): void {
    charts[0]?.forEach((chart) => {
      if (!this.updaterMap.has(chart.name)) {
        return;
      }

      const dataUpdate$ = this.updaterMap.get(chart.name);
      if (dataUpdate$?.value) {
        dataUpdate$.next([...dataUpdate$.value, this.viewerMapperService.prepareTagDataMapRest(chart, 1)]);
      }
    });

    charts[1]?.forEach((chart) => {
      if (!this.updaterMap.has(chart.attributeId)) {
        return;
      }

      const dataUpdate$ = this.updaterMap.get(chart.attributeId);
      if (dataUpdate$?.value) {
        dataUpdate$.next([...dataUpdate$.value, this.viewerMapperService.prepareOmAttrDataMapRest(chart, 1)]);
      }
    });
  }

  private printChart(): void {
    const ref = this.popupService.open(
      ChartPrintComponent,
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
