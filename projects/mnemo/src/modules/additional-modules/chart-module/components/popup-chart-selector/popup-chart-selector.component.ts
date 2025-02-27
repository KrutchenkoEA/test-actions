/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed, uuidGenerate } from '@tl-platform/core';
import { mxCell } from 'mxgraph';
import { debounceTime, Observable, skip, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  IPopupForm,
  IVCLayerDataLineViewOptions,
  IVCLayerViewOptions,
  IVCSettingsPopup,
  IVCViewOpt,
} from '../../../../../models';
import { PopupService } from '../../../../../services';
import {
  PlayerModeService,
  ViewerFormulaService,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../../../pure-modules';
import { ChartOptionsService, ChartService, PopupChartService } from '../../services';
import { ChartSettingComponent } from '../chart-setting/chart-setting.component';
import { ChartWrapComponent } from '../chart-wrap/chart-wrap.component';

/**  @deprecated use MnemoChartModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-popup-chart-selector',
  templateUrl: './popup-chart-selector.component.html',
  styleUrl: './popup-chart-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopupChartSelectorComponent implements OnInit, OnDestroy {
  public language$ = inject<Observable<string>>(LANGUAGE);
  private readonly document = inject<Document>(DOCUMENT);
  public viewerService = inject(ViewerService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  private readonly popupChartService = inject(PopupChartService);
  private readonly chartService = inject(ChartService);
  private readonly chartOptionsService = inject(ChartOptionsService);
  public playerModeService = inject(PlayerModeService);
  public viewerTagService = inject(ViewerTagService);
  public viewerOMService = inject(ViewerOMService);
  public viewerFormulaService = inject(ViewerFormulaService);

  public form: FormGroup = this.formBuilder.group({
    dataSources: new FormArray([]),
  });

  public get dataSources(): FormArray {
    return this.form.controls.dataSources as FormArray;
  }

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(skip(1), debounceTime(1500), takeUntilDestroyed(this))
      .subscribe((v: { dataSources: IPopupForm[] }) => {
        v.dataSources.forEach((item, index) => this.drawChart(item, index));
      });

    this.addDataSource(this.popupChartService.firstChartId);

    this.popupChartService.tooltipChartData$
      .pipe(
        debounceTime(1500),
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((cell) => this.drawChartByTooltip(cell as mxCell));
  }

  public ngOnDestroy(): void {
    this.popupChartService.tooltipChartData$.next(null);
    this.dataSources.controls.forEach(() => this.deleteDataSource(0));
    this.popupService.removeOverlay();
  }

  public addDataSource(id?: string): void {
    const groupId = id?.length ? id : uuidGenerate();
    this.chartService.chartOptions.set(groupId, this.chartOptionsService.getDefaultChartOptions());
    this.popupChartService.layerNames.forEach((n, i) => {
      this.chartService.layerOptions.set(`${groupId}-${n}`, this.chartOptionsService.getDefaultLayerOptions(i));
    });

    this.dataSources.push(
      new FormGroup({
        id: new FormControl(groupId),
        points: new FormControl(0),
        tags: new FormControl(),
        omAttrs: new FormControl(),
        formulas: new FormControl(),
      })
    );

    this.popupChartService.chartsData.set(
      groupId,
      JSON.stringify(this.dataSources.controls[this.dataSources.controls.length - 1].getRawValue())
    );
  }

  public deleteDataSource(idx: number): void {
    const groupId = this.dataSources.controls[idx]?.get('id').value;
    this.chartService.deleteLineOptions(groupId, '', true);
    this.chartService.chartOptions.delete(groupId);
    this.popupChartService.layerNames?.forEach((l) => this.chartService.layerOptions.delete(`${groupId}-${l}`));
    this.popupChartService.chartsData.delete(groupId);
    this.popupChartService.chartsDataChanged.delete(groupId);
    this.dataSources.removeAt(idx);
    this.popupChartService.popupContainer.get(groupId)?.overlayRef?.dispose();
  }

  public openSettingPopup(idx: number): void {
    const groupId = this.dataSources.controls[idx]?.get('id').value;
    this.popupService
      .open(
        ChartSettingComponent,
        {
          chartOpt: {
            chartId: groupId,
            viewOptions: this.chartService.chartOptions.get(groupId),
          },
          layerOpt: this.popupChartService.layerNames.map((l) => {
            return {
              layerTitle: `${groupId}-${l}`,
              layerName: l,
              layerViewOptions: this.chartService.layerOptions.get(`${groupId}-${l}`),
            };
          }),
          trendOpt: {
            layerDataViewOptions: this.popupChartService.lineDefaultOptions,
          },
          reqOpt: {
            date: this.chartService.getLineOptions(groupId, '')?.req?.date,
            pointsCount: this.dataSources.controls[idx].get('points').value,
            exponent: 1,
            sourceType: 'tag',
            name: '',
            data: [],
          },
          isGroup: true,
        },
        {
          width: this.document.defaultView.innerWidth * 0.8,
          height: this.document.defaultView.innerHeight * 0.8,
          positions: [
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'center',
              overlayY: 'center',
            },
          ],
        }
      )
      .popupRef.afterClosed()
      .subscribe(
        (
          opt: {
            chartOpt: IVCViewOpt;
            layerOpt: IVCLayerViewOptions[];
            trendOpt: IVCLayerDataLineViewOptions;
            reqOpt: IVCSettingsPopup;
            reset: boolean;
          } | null
        ) => {
          if (opt) {
            if (opt?.reset) {
              this.resetStyle(idx);
            }
            if (opt?.chartOpt) {
              this.chartService.chartOptions.set(groupId, opt.chartOpt);
            }
            if (opt?.layerOpt) {
              opt.layerOpt.forEach((l, index) => {
                this.chartService.layerOptions.set(`${groupId}-${this.popupChartService.layerNames[index]}`, l);
              });
            }
            if (opt?.trendOpt) {
              this.chartService.setLineOptions(
                groupId,
                '',
                {
                  view: opt.trendOpt,
                  req: opt.reqOpt,
                },
                false
              );
            }

            const item = this.dataSources.controls[idx].value;
            if (opt?.reqOpt?.date?.start && opt?.reqOpt?.date?.end) {
              item.date = opt?.reqOpt?.date;
            } else {
              item.date = null;
            }

            this.drawChart(item, idx, true);
          }
        }
      );
  }

  public clearPoints(idx: number): void {
    this.dataSources.controls[idx].get('points').patchValue(0);
  }

  public resetStyle(idx: number): void {
    const groupId = this.dataSources.controls[idx]?.get('id').value;
    this.chartService.chartOptions.set(groupId, this.chartOptionsService.getDefaultChartOptions());
    this.popupChartService.layerNames.forEach((n, i) => {
      this.chartService.layerOptions.set(`${groupId}-${n}`, this.chartOptionsService.getDefaultLayerOptions(i));
    });
    this.dataSources.controls[idx]?.reset({ points: 0 });
    this.chartService.deleteLineOptions(groupId, '', true);
    this.popupChartService.popupContainer.get(groupId)?.overlayRef?.dispose();
  }

  private drawChart(item: IPopupForm, index: number, isNeedDelete: boolean = false): void {
    if (!item.tags?.length && !item.omAttrs?.length && !item.formulas?.length) {
      return;
    }

    const deleteContainer = (): void => {
      this.popupChartService.popupContainer.get(item.id).overlayRef?.dispose();
      this.popupChartService.popupContainer.get(item.id).overlayRef?.detach();
      this.popupChartService.popupContainer.delete(item.id);
      this.popupChartService.chartsDataChanged.get(item.id)?.unsubscribe();
      this.popupChartService.chartsDataChanged.delete(item.id);
      this.popupChartService.chartsData.delete(item.id);
    };

    if (isNeedDelete) {
      deleteContainer();
    }

    if (JSON.stringify(item) === this.popupChartService.chartsData.get(item.id)) {
      return;
    }
    this.popupChartService.chartsData.set(
      item.id,
      JSON.stringify(this.dataSources.controls[this.dataSources.controls.length - 1].getRawValue())
    );

    if (this.popupChartService.popupContainer.get(item.id) && !isNeedDelete) {
      this.popupChartService.chartsDataChanged.get(item.id).next(item);
      return;
    }

    this.popupChartService.chartsDataChanged.set(item.id, new Subject());

    const chart = this.popupService.open(
      ChartWrapComponent,
      {
        idx: index,
        chartId: item.id,
        item,
        itemChanged$: this.popupChartService.chartsDataChanged.get(item.id),
      },
      {
        width: 840,
        height: 480,
        positions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        hasBackdrop: false,
      }
    );

    this.popupChartService.popupContainer.set(item.id, chart);

    chart.popupRef.afterClosed().subscribe(() => {
      this.dataSources.controls[index].patchValue(
        {
          tags: null,
          omAttrs: null,
          formulas: null,
        },
        { emitEvent: false, onlySelf: true }
      );
      deleteContainer();
    });
  }

  private drawChartByTooltip(cell: Partial<mxCell>): void {
    const group = this.dataSources.controls[0];
    if (cell.tagName?.length && (cell.sourceType === 'tag' || !cell?.sourceType || cell.sourceType === 'om')) {
      const existTags = group.get('tags')?.getRawValue();
      group
        .get('tags')
        .patchValue(existTags?.length ? [...group.get('tags').getRawValue(), cell.tagName] : [cell.tagName], {
          emitEvent: false,
        });
    } else if (cell.sourceType === 'omAttr') {
      const existAttrs = group.get('omAttrs')?.getRawValue();
      const attr = this.viewerOMService.omObjectMap$.value.get(cell.attrGuid);
      group.get('omAttrs').patchValue(existAttrs?.length ? [...group.get('omAttrs').getRawValue(), attr] : [attr], {
        emitEvent: false,
      });
    } else if (cell.sourceType === 'formula') {
      const existFormulas = group.get('formulas')?.getRawValue();
      const formula = this.viewerFormulaService.formulaObjectMap$.value.get(cell.formula);
      group
        .get('formulas')
        .patchValue(existFormulas?.length ? [...group.get('formulas').getRawValue(), formula] : [formula], {
          emitEvent: false,
        });
    }

    this.drawChart(group.getRawValue(), 0);
  }
}
