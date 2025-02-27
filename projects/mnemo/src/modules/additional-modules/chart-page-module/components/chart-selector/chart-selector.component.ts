/* eslint-disable import/no-extraneous-dependencies */
import { Direction } from '@angular/cdk/bidi';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslocoService } from '@jsverse/transloco';
import { DecorateUntilDestroy, LANGS_ENUM, LANGS_LABELS, LANGUAGE, takeUntilDestroyed } from '@tl-platform/core';
import { debounceTime, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IVCLayerDataLineViewOptions, IVCLayerViewOptions, IVCViewOpt, SourceType } from '../../../../../models';
import { PopupService } from '../../../../../services';
import { ViewerFormulaService, ViewerOMService, ViewerTagService } from '../../../../pure-modules';
import { ChartOptionsService, ChartService, ChartSettingComponent, ChartWrapService } from '../../../chart-module';
import { ChartPageAddService, ChartPageDataService } from '../../services';

/**  @deprecated use MnemoChartPageModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-selector',
  templateUrl: './chart-selector.component.html',
  styleUrls: ['./chart-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSelectorComponent implements OnInit, OnDestroy {
  readonly language$ = inject<Observable<string>>(LANGUAGE);
  private readonly document = inject<Document>(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  public chartService = inject(ChartService);
  public chartWrapService = inject(ChartWrapService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly translocoService = inject(TranslocoService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly chartOptionsService = inject(ChartOptionsService);
  public cPAddService = inject(ChartPageAddService);
  public cPDataService = inject(ChartPageDataService);

  public form: FormGroup;

  constructor() {
    this.form = this.formBuilder.group({
      date: { start: this.cPDataService.date.start, end: this.cPDataService.date.end },
      pointsCount: this.cPDataService.pointsCount,
    });
  }

  public ngOnDestroy(): void {
    this.cPDataService.activeTagMap.clear();
    this.chartWrapService.chartWrapClear$.next(null);
  }

  public ngOnInit(): void {
    this.cPDataService.currentDirection = LANGS_LABELS.get(<LANGS_ENUM>this.translocoService.getActiveLang()).dir;
    this.chartService.chartOptions.set(
      this.chartWrapService.chartId,
      this.chartOptionsService.getDefaultChartOptions()
    );

    this.viewerTagService.tagsNamesOnlyAll$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((tags) => {
        if (tags?.length) {
          this.chartService.layerOptions.set(
            `${this.chartWrapService.chartId}-tag`,
            this.chartOptionsService.getDefaultLayerOptions(0)
          );
          this.chartWrapService.layerNames.push('tag');
        }
        this.cPDataService.activeTagMap.clear();
        tags.forEach((tag, index) => {
          this.cPDataService.activeTagMap.set(index, { tagName: tag, isActive: false, index });
        });
      });

    this.viewerOMService.omObjectMap$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((attrMap) => {
        if (attrMap.size) {
          this.chartService.layerOptions.set(
            `${this.chartWrapService.chartId}-omAttr`,
            this.chartOptionsService.getDefaultLayerOptions(1)
          );
          this.chartWrapService.layerNames.push('omAttr');
        }
        this.cPDataService.activeOmAttrMap.clear();
        let idx = 0;
        attrMap?.forEach((attr) => {
          this.cPDataService.activeOmAttrMap.set(idx, {
            ...attr,
            isActive: false,
            name: `${attr.attrParentPath} | ${attr.attrName}`,
            index: idx,
          });
          idx += 1;
        });
      });

    this.viewerFormulaService.formulaObjectMap$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((attrMap) => {
        if (attrMap.size) {
          this.chartService.layerOptions.set(
            `${this.chartWrapService.chartId}-formula`,
            this.chartOptionsService.getDefaultLayerOptions(2)
          );
          this.chartWrapService.layerNames.push('formula');
        }
        this.cPDataService.activeFormulaAttrMap.clear();
        let idx = 0;
        attrMap?.forEach((attr) => {
          this.cPDataService.activeFormulaAttrMap.set(idx, { ...attr, isActive: false });
          idx += 1;
        });
      });

    this.form
      .get('pointsCount')
      .valueChanges.pipe(debounceTime(600), takeUntilDestroyed(this))
      .subscribe((count) => {
        this.cPDataService.pointsCount = count;
        this.cPDataService.drawChart();
      });

    this.cPDataService.clearSelection$.pipe(takeUntilDestroyed(this)).subscribe(() => this.clearSelection());
  }

  public onKeyboardClick(key): void {
    if (key && key?.key === 'Enter') {
      this.onCalendarClose();
    }
  }

  public onCalendarClose(): void {
    this.cPDataService.date = {
      start: this.form.value?.date?.start ? this.form.value?.date?.start : null,
      end: this.form.value?.date?.end ? this.form.value?.date?.end : null,
    };
    this.form.get('pointsCount').patchValue(0, { emitEvent: false });
    this.cPDataService.pointsCount = 0;
    this.cPDataService.drawChart();
  }

  public clearSelection(): void {
    this.form.patchValue(
      {
        date: { start: this.cPDataService.date.start, end: this.cPDataService.date.end },
        pointsCount: 0,
      },
      { emitEvent: false }
    );
    this.cPDataService.activeTagMap.forEach((val) => {
      val.isActive = false;
    });
    this.cPDataService.activeOmAttrMap.forEach((val) => {
      val.isActive = false;
    });
    this.cPDataService.activeFormulaAttrMap.forEach((val) => {
      val.isActive = false;
    });
    this.chartWrapService.chartWrapClear$.next(null);
    this.chartWrapService.chartWrapLoading$.next(false);
    this.changeDetectorRef.markForCheck();
  }

  public addChart(event: MouseEvent, type: SourceType | 'user'): void {
    event.stopPropagation();
    switch (type) {
      case 'tag':
        this.cPAddService.addTag();
        break;
      case 'omAttr':
        this.cPAddService.addOmAttribute();
        break;
      case 'formula':
        this.cPAddService.addFormula();
        break;
      case 'user':
        this.cPAddService.addUserPoints();
        break;
      default:
        break;
    }
  }

  public changeDir(event: Direction): void {
    this.cPDataService.currentDirection = event;
  }

  public openSettingPopup(): void {
    this.popupService
      .open(
        ChartSettingComponent,
        {
          chartOpt: {
            chartId: this.chartWrapService.chartId,
            viewOptions: this.chartService.chartOptions.get(this.chartWrapService.chartId),
          },
          layerOpt: this.chartWrapService.layerNames.map((l) => {
            return {
              layerTitle: l,
              layerViewOptions: this.chartService.layerOptions.get(`${this.chartWrapService.chartId}-${l}`),
            };
          }),
          trendOpt: {
            layerDataViewOptions: this.chartService.lineDefaultOptions,
          },
          isGroup: true,
          maxSelectedCount: this.cPDataService.maxSelectedCount,
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
            reset: boolean;
            maxSelectedCount?: number;
          } | null
        ) => {
          if (opt) {
            if (opt?.reset) {
              this.chartService.resetOptions(this.chartWrapService.chartId, this.chartWrapService.layerNames);
              this.cPDataService.drawChart();
              return;
            }

            if (opt?.chartOpt) {
              this.chartService.chartOptions.set(this.chartWrapService.chartId, opt.chartOpt);
            }
            if (opt?.layerOpt) {
              opt.layerOpt.forEach((l, index) => {
                this.chartService.layerOptions.set(
                  `${this.chartWrapService.chartId}-${this.chartWrapService.layerNames[index]}`,
                  l
                );
              });
            }
            if (opt?.trendOpt) {
              this.chartService.lineDefaultOptions = opt.trendOpt;
            }
            if (opt?.maxSelectedCount) {
              this.cPDataService.maxSelectedCount = opt.maxSelectedCount;
            }

            this.cPDataService.drawChart(false);
          }
        }
      );
  }

  public onClickPrint(): void {
    this.chartWrapService.printEmit$.next(null);
  }
}
