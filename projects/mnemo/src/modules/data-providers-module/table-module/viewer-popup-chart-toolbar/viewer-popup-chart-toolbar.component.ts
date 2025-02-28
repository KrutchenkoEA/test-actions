/* eslint-disable import/no-extraneous-dependencies */
import { OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed } from '@tl-platform/core';
import { debounceTime, Observable } from 'rxjs';
import { ChartNameType, IChartOptions, LineType, SelectedTagType } from '../../../../models';
import { PopupReference, PopupService } from '../../../../services';
import { PlayerModeService, ViewerService, ViewerTagService } from '../../../pure-modules';
import { ViewerPopupChartComponent } from '../viewer-popup-chart/viewer-popup-chart.component';
import { ViewerPopupChartService } from '../viewer-popup-chart/viewer-popup-chart.service';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-popup-chart-toolbar',
  templateUrl: './viewer-popup-chart-toolbar.component.html',
  styleUrls: ['./viewer-popup-chart-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewerPopupChartToolbarComponent implements OnInit, OnDestroy {
  public language$ = inject<Observable<string>>(LANGUAGE);
  public viewerService = inject(ViewerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  public popupChartService = inject(ViewerPopupChartService);
  public playerModeService = inject(PlayerModeService);
  private readonly viewerTagService = inject(ViewerTagService);

  public tagNames$: Observable<string[] | []>;
  public chartNames: ChartNameType[] = [];
  public lineType: LineType[] = [];
  public form: FormGroup = this.formBuilder.group({
    pointsCount: new FormControl<number>(0),
    chartTags1$: new FormControl<SelectedTagType>([]),
    chartTags2$: new FormControl<SelectedTagType>([]),
    chartTags3$: new FormControl<SelectedTagType>([]),
  });

  private popupContainer: {
    chartTags1$: { popupRef: PopupReference<ViewerPopupChartComponent>; overlayRef: OverlayRef } | null;
    chartTags2$: { popupRef: PopupReference<ViewerPopupChartComponent>; overlayRef: OverlayRef } | null;
    chartTags3$: { popupRef: PopupReference<ViewerPopupChartComponent>; overlayRef: OverlayRef } | null;
  } = {
    chartTags1$: null,
    chartTags2$: null,
    chartTags3$: null,
  };

  public ngOnInit(): void {
    this.chartNames = this.popupChartService.chartNames;
    this.lineType = this.popupChartService.lines;
    this.tagNames$ = this.viewerTagService.tagsNamesOnly$.asObservable();

    this.popupChartService.chartNames.forEach((chartName) => this.clearChartContainer(chartName));

    this.popupChartService.chartTags1$
      .pipe(takeUntilDestroyed(this))
      .subscribe((res) => this.form.get('chartTags1$').patchValue(res, { emitEvent: false }));

    this.popupChartService.chartForClear$
      .pipe(takeUntilDestroyed(this))
      .subscribe((chartName) => this.form.get(chartName)?.patchValue([], { emitEvent: false }));

    this.chartNames.forEach((chartName) => {
      this.form
        .get(chartName)
        .valueChanges.pipe(debounceTime(800), takeUntilDestroyed(this))
        .subscribe((d) => this.popupChartService[chartName].next(d));
    });

    this.form
      .get('pointsCount')
      .valueChanges.pipe(debounceTime(800), takeUntilDestroyed(this))
      .subscribe((d) => this.popupChartService.pointsCount$.next(d));

    this.popupChartService.chartNames.forEach((chartName) => {
      this.popupChartService[chartName].pipe(takeUntilDestroyed(this)).subscribe((d) => {
        if (d != null && !!d.length) {
          this.openChart(chartName);
        } else {
          this.popupContainer[chartName]?.overlayRef.dispose();
          this.popupContainer[chartName] = null;
        }
      });
    });
  }

  public ngOnDestroy(): void {
    this.popupService.removeOverlay();
    this.popupChartService.chartNames.forEach((chartName) => this.clearChartContainer(chartName));
  }

  public onClickClear(chart): void {
    this.form.get(chart)?.patchValue([]);
  }

  public changeType(idx: number, lineType: LineType): void {
    this.popupChartService[this.popupChartService.lineTypes[idx]].next(lineType);
  }

  public onClickClearPoints(): void {
    this.form.get('pointsCount').patchValue(0);
    this.chartNames.forEach((ch) => {
      this.popupChartService[ch].next(this.form.get(ch).value);
    });
  }

  private clearChartContainer(chartName: ChartNameType): void {
    this.popupChartService.chartForClear$.next(chartName);
    this.popupChartService[chartName].next([]);
    this.popupContainer[chartName] = null;
  }

  private openChart(chartName: ChartNameType): void {
    if (this.popupContainer[chartName]?.popupRef) {
      return;
    }
    const data: IChartOptions = {
      width: 840,
      height: 480,
      chartName,
    };
    this.popupContainer[chartName] = this.popupService.open(ViewerPopupChartComponent, data, {
      width: data.width,
      height: data.height,
      positions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
      hasBackdrop: false,
    });
    this.popupContainer[chartName].popupRef.afterClosed().subscribe(() => this.clearChartContainer(chartName));
  }
}
