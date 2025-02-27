/* eslint-disable import/no-extraneous-dependencies */
import { Direction } from '@angular/cdk/bidi';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed } from '@tl-platform/core';
import { TLUI_CHART_FORM_CREATE_SERVICE, TluiChartFormCreateService } from '@tl-platform/ui';
import { debounceTime, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { IMnemoChartSettingModel, SourceType } from '../../../../../models';
import { PopupService } from '../../../../../services';
import {
  MnemoChartSettingPopupComponent,
  ViewerFormulaService,
  ViewerOMService,
  ViewerTagService,
} from '../../../../pure-modules';
import {
  MnemoChartFormulaService,
  MnemoChartOmService,
  MnemoChartService,
  MnemoChartTagsService,
  MnemoChartWrapService,
} from '../../../mnemo-chart-module/services';
import { MnemoChartPageAddService, MnemoChartPageDataService } from '../../services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-selector-2',
  templateUrl: './chart-selector.component.html',
  styleUrls: ['./chart-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartSelectorComponent implements OnInit, OnDestroy {
  readonly language$ = inject<Observable<string>>(LANGUAGE);
  private readonly formCreateService = inject<TluiChartFormCreateService>(TLUI_CHART_FORM_CREATE_SERVICE);
  private readonly popupService = inject(PopupService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly mnemoChartService = inject(MnemoChartService);
  private readonly mnemoChartPageAddService = inject(MnemoChartPageAddService);
  private readonly mnemoChartTagsService = inject(MnemoChartTagsService);
  private readonly mnemoChartOmService = inject(MnemoChartOmService);
  private readonly mnemoChartFormulaService = inject(MnemoChartFormulaService);
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  public mnemoChartPageDataService = inject(MnemoChartPageDataService);

  public ngOnDestroy(): void {
    this.mnemoChartPageDataService.activeTagMap.clear();
    this.mnemoChartPageDataService.activeOmAttrMap.clear();
    this.mnemoChartPageDataService.activeFormulaAttrMap.clear();
    this.mnemoChartWrapService.chartWrapClear$.next(null);
  }

  public ngOnInit(): void {
    this.mnemoChartTagsService.updateEnabled = false;
    this.mnemoChartOmService.updateEnabled = false;
    this.mnemoChartFormulaService.updateEnabled = false;

    this.mnemoChartService.setChartOptions(
      this.formCreateService.createDefaultData(),
      this.mnemoChartWrapService.chartId
    );

    this.viewerTagService.tagsNamesOnlyAll$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((tags) => {
        this.mnemoChartPageDataService.activeTagMap.clear();
        tags.forEach((tag, index) => {
          this.mnemoChartPageDataService.activeTagMap.set(index, { tagName: tag, isActive: false, index });
        });
      });

    this.viewerOMService.omObjectMap$
      .pipe(
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((attrMap) => {
        this.mnemoChartPageDataService.activeOmAttrMap.clear();
        let idx = 0;
        attrMap?.forEach((attr) => {
          this.mnemoChartPageDataService.activeOmAttrMap.set(idx, {
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
        this.mnemoChartPageDataService.activeFormulaAttrMap.clear();
        let idx = 0;
        attrMap?.forEach((attr) => {
          this.mnemoChartPageDataService.activeFormulaAttrMap.set(idx, { ...attr, isActive: false });
          idx += 1;
        });
      });

    this.mnemoChartPageDataService.clearSelection$
      .pipe(takeUntilDestroyed(this))
      .subscribe(() => this.clearSelection());

    this.mnemoChartPageDataService.requestForm.controls.points.valueChanges
      .pipe(debounceTime(500), takeUntilDestroyed(this))
      .subscribe(() => this.mnemoChartPageDataService.drawChart(false));

    this.mnemoChartPageDataService.requestForm?.controls?.realtimeRefresh?.valueChanges
      .pipe(takeUntilDestroyed(this))
      .subscribe((updateEnabled) => {
        this.mnemoChartTagsService.updateEnabled = updateEnabled;
        this.mnemoChartOmService.updateEnabled = updateEnabled;
        this.mnemoChartFormulaService.updateEnabled = updateEnabled;
      });
  }

  public onKeyboardClick(key: KeyboardEvent): void {
    if (key && key?.key === 'Enter') {
      this.onCalendarClose();
    }
  }

  public onCalendarClose(): void {
    this.mnemoChartPageDataService.requestForm.controls.points.patchValue(0, { emitEvent: false });
    this.mnemoChartPageDataService.drawChart();
  }

  public clearSelection(): void {
    this.mnemoChartPageDataService.resetRequestForm();
    this.mnemoChartPageDataService.activeTagMap.forEach((val) => {
      val.isActive = false;
    });
    this.mnemoChartPageDataService.activeOmAttrMap.forEach((val) => {
      val.isActive = false;
    });
    this.mnemoChartPageDataService.activeFormulaAttrMap.forEach((val) => {
      val.isActive = false;
    });
    this.mnemoChartWrapService.chartWrapClear$.next(null);
    this.mnemoChartWrapService.chartWrapLoading$.next(false);
    this.changeDetectorRef.markForCheck();
  }

  public openSettingPopup(): void {
    const data = {
      chartOptions: this.mnemoChartService.getChartOptions(this.mnemoChartWrapService.chartId),
      requestOptions: this.mnemoChartPageDataService.requestForm.value,
      viewOptions: this.mnemoChartPageDataService.viewForm.value,
    };
    this.popupService
      .open(MnemoChartSettingPopupComponent, data as IMnemoChartSettingModel)
      .popupRef.afterClosed()
      .subscribe((options: IMnemoChartSettingModel) => {
        if (!options || JSON.stringify(options) === JSON.stringify(data)) return;
        this.mnemoChartService.setChartOptions(
          options?.chartOptions ?? data?.chartOptions,
          this.mnemoChartWrapService.chartId
        );
        this.mnemoChartService.setRequestOptions(
          options?.requestOptions ?? data?.requestOptions,
          this.mnemoChartWrapService.chartId
        );
        this.mnemoChartService.setViewOptions(
          options?.viewOptions ?? data.viewOptions,
          this.mnemoChartWrapService.chartId
        );
        this.mnemoChartPageDataService.requestForm.patchValue(options.requestOptions ?? data?.requestOptions);
        this.mnemoChartPageDataService.viewForm.patchValue(options.viewOptions ?? data.viewOptions);
        this.mnemoChartPageDataService.drawChart(false);
      });
  }

  public onClickPrint(): void {
    this.mnemoChartWrapService.printEmit$.next(null);
  }

  public addChart(event: MouseEvent, type: SourceType | 'user'): void {
    event.stopPropagation();
    switch (type) {
      case 'tag':
        this.mnemoChartPageAddService.addTag();
        break;
      case 'omAttr':
        this.mnemoChartPageAddService.addOmAttribute();
        break;
      case 'formula':
        this.mnemoChartPageAddService.addFormula();
        break;
      case 'user':
        this.mnemoChartPageAddService.addUserPoints();
        break;
      default:
        break;
    }
  }

  public changeDir(event: Direction): void {
    this.mnemoChartPageDataService.currentDirection = event;
  }
}
