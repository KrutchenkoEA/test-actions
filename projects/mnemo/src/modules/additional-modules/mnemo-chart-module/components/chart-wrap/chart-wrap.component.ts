/* eslint-disable import/no-extraneous-dependencies */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS, popup } from '../../../../../consts';
import { IMnemoChartDateOptions, IMnemoChartPopupForm, IMnemoChartWrapperData } from '../../../../../models';
import { POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import { MnemoChartFormulaService } from '../../services/mnemo-chart-formula.service';
import { MnemoChartOmService } from '../../services/mnemo-chart-om.service';
import { MnemoChartTagsService } from '../../services/mnemo-chart-tags.service';
import { MnemoChartWrapService } from '../../services/mnemo-chart-wrap.service';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-wrap-2',
  templateUrl: './chart-wrap.component.html',
  styleUrl: './chart-wrap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MnemoChartWrapService, MnemoChartTagsService, MnemoChartOmService, MnemoChartFormulaService],
  animations: [popup],
})
export class MnemoChartWrapComponent implements OnInit, AfterViewInit, OnDestroy {
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  public readonly data = inject<IMnemoChartWrapperData>(POPUP_DIALOG_DATA);
  private readonly popupRef = inject<PopupReference<MnemoChartWrapComponent>>(PopupReference);
  private readonly mnemoChartTagsService = inject(MnemoChartTagsService);
  private readonly mnemoChartOmService = inject(MnemoChartOmService);
  private readonly mnemoChartFormulaService = inject(MnemoChartFormulaService);

  public chartId: string = 'chart-page';
  public resizeObserver: ResizeObserver = null;
  @ViewChild('chartContainer') public chartContainer: ElementRef<HTMLDivElement>;

  public ngOnInit(): void {
    if (this.data?.chartId) {
      this.mnemoChartWrapService.chartId = this.data.chartId;
    } else {
      this.mnemoChartWrapService.chartId = this.chartId;
    }
    if (this.data?.item) {
      this.drawChart(this.data.item);
    }

    this.data?.itemChanged$?.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (v) {
        this.drawChart(v);
      }
    });
  }

  public ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      if (entries?.[0]?.contentRect) {
        this.mnemoChartWrapService.chartSizeChanged$.next({
          width: entries?.[0].contentRect.width,
          height: (entries?.[0].contentRect.height || 0) - 50,
        });
      }
    });

    setTimeout(() => {
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    });
  }

  public ngOnDestroy(): void {
    this.mnemoChartWrapService.cleanChartData();
    this.resizeObserver.unobserve(this.chartContainer.nativeElement);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onClickPrint(): void {
    this.mnemoChartWrapService.printEmit$.next(null);
  }

  public checkDateEqual(date: IMnemoChartDateOptions): boolean {
    return date?.end === new Date();
  }

  private drawChart(item: IMnemoChartPopupForm): void {
    this.mnemoChartTagsService.updateEnabled = item.requestForm?.realtimeRefresh !== false;
    this.mnemoChartOmService.updateEnabled = item.requestForm?.realtimeRefresh !== false;
    this.mnemoChartFormulaService.updateEnabled = item.requestForm?.realtimeRefresh !== false;

    this.mnemoChartWrapService.chartWrapData$.next({
      tags: item?.sourceForm?.tagNamesString?.map((tag, index) => {
        return { tagName: tag, isActive: true, index };
      }),
      omAttributes: item?.sourceForm?.omAttrs?.map((attr, index) => {
        return { ...attr, name: `${attr.attrParentPath} | ${attr.attrName}`, isActive: true, index };
      }),
      formulas: item?.sourceForm?.formulas?.map((formula) => {
        return { ...formula, isActive: true };
      }),
      realtimeRefresh: item?.requestForm?.realtimeRefresh,
      date:
        item?.requestForm?.date?.start && item?.requestForm?.date?.end
          ? item.requestForm?.date
          : {
              start: new Date(
                new Date().setHours(
                  new Date().getHours() -
                    (item?.requestForm?.hoursPeriod ?? MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod)
                )
              ),
              end: new Date(),
            },
      fixedPoints: item?.requestForm?.fixedPoints !== false,
      points: item.requestForm?.points,
      hoursPeriod: item?.requestForm?.hoursPeriod,
      scale: item?.requestForm?.scale,
      intervalsCount: item?.requestForm?.intervalsCount,
    });
  }
}
