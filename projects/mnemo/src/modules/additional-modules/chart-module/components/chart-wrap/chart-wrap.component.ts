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
import { Subject } from 'rxjs';
import { popup } from '../../../../../consts';
import { IPopupForm } from '../../../../../models';
import { POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import {
  ChartOptionsService,
  ChartPageFormulaService,
  ChartPageOmService,
  ChartPageTagsService,
  ChartService,
  ChartWrapService,
} from '../../services';

/**  @deprecated use MnemoChartModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-wrap',
  templateUrl: './chart-wrap.component.html',
  styleUrl: './chart-wrap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ChartWrapService, ChartPageTagsService, ChartPageOmService, ChartPageFormulaService],
  animations: [popup],
})
export class ChartWrapComponent implements OnInit, AfterViewInit, OnDestroy {
  public chartWrapService = inject(ChartWrapService);
  public chartService = inject(ChartService);
  readonly data = inject<{
    idx: number;
    chartId: string;
    selectorEnable: boolean;
    item: IPopupForm;
    itemChanged$: Subject<IPopupForm>;
  }>(POPUP_DIALOG_DATA);
  private readonly popupRef = inject<PopupReference<ChartWrapComponent>>(PopupReference);
  private readonly chartOptionsService = inject(ChartOptionsService);

  public chartId: string = 'chart-page';
  public resizeObserver: ResizeObserver = null;
  public isUpdateEnable: boolean = true;
  @ViewChild('chartContainer') public chartContainer: ElementRef<HTMLDivElement>;

  public ngOnInit(): void {
    if (this.data?.chartId) {
      this.chartWrapService.chartId = this.data.chartId;
    } else {
      this.chartWrapService.chartId = this.chartId;
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
        this.chartWrapService.chartSizeChanged$.next({
          width: entries?.[0].contentRect.width,
          height: (entries?.[0].contentRect.height || 0) - 50,
        });
      }
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  public ngOnDestroy(): void {
    this.chartWrapService.cleanChartData();
    this.resizeObserver.unobserve(this.chartContainer.nativeElement);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onClickPrint(): void {
    this.chartWrapService.printEmit$.next(null);
  }

  private drawChart(item: IPopupForm): void {
    this.isUpdateEnable = !(item?.date?.start && item?.date?.end);
    if (item?.tags?.length) {
      this.chartService.layerOptions.set(
        `${this.chartWrapService.chartId}-tag`,
        this.chartOptionsService.getDefaultLayerOptions(0),
      );
      this.chartWrapService.layerNames.push('tag');
    }
    if (item?.omAttrs?.length) {
      this.chartService.layerOptions.set(
        `${this.chartWrapService.chartId}-omAttr`,
        this.chartOptionsService.getDefaultLayerOptions(1),
      );
      this.chartWrapService.layerNames.push('omAttr');
    }
    if (item?.formulas?.length) {
      this.chartService.layerOptions.set(
        `${this.chartWrapService.chartId}-formula`,
        this.chartOptionsService.getDefaultLayerOptions(2),
      );
      this.chartWrapService.layerNames.push('formula');
    }

    this.chartWrapService.chartPageData$.next({
      tags: item?.tags?.map((tag, index) => {
        return { tagName: tag, isActive: true, index };
      }),
      omAttributes: item?.omAttrs?.map((attr, index) => {
        return { ...attr, name: `${attr.attrParentPath} | ${attr.attrName}`, isActive: true, index };
      }),
      formulas: item?.formulas?.map((formula) => {
        return { ...formula, isActive: true };
      }),
      pointsCount: item.points,
      date:
        item?.date?.start && item?.date?.end
          ? item.date
          : {
            start: new Date(new Date().setHours(new Date().getHours() - 8)),
            end: new Date(),
          },
      isExistData: false,
    });
  }
}
