/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, LANGUAGE, takeUntilDestroyed, uuidGenerate } from '@tl-platform/core';
import { TLUI_CHART_FORM_CREATE_SERVICE, TluiChartFormCreateService } from '@tl-platform/ui';
import { mxCell } from 'mxgraph';
import { BehaviorSubject, debounceTime, Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
  MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_SOURCE_OPTIONS,
  MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
} from '../../../../../consts';
import {
  IMnemoChartPopupForm,
  IMnemoChartRequestOptions,
  IMnemoChartSettingModel,
  IMnemoChartSourceForm,
  IMnemoChartViewOptions,
  IMnemoChartWrapperData,
  ToFormControlType,
} from '../../../../../models';
import { MnemoFormCreateService, PopupService } from '../../../../../services';
import {
  MnemoChartSettingPopupComponent,
  PlayerModeService,
  ViewerFormulaService,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../../../pure-modules';
import { MnemoChartService, MnemoPopupChartService } from '../../services';
import { MnemoChartWrapComponent } from '../chart-wrap/chart-wrap.component';

type MnemoPopupFormType = FormGroup<{
  groupId: FormControl<string>;
  requestForm: FormGroup<ToFormControlType<IMnemoChartRequestOptions>>;
  viewForm: FormGroup<ToFormControlType<IMnemoChartViewOptions>>;
  sourceForm: FormGroup<ToFormControlType<IMnemoChartSourceForm>>;
}>;

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-popup-chart-selector-2',
  templateUrl: './popup-chart-selector.component.html',
  styleUrl: './popup-chart-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoPopupChartSelectorComponent implements OnInit, OnDestroy {
  public language$ = inject<Observable<string>>(LANGUAGE);
  private readonly tluiChartFormCreateService = inject<TluiChartFormCreateService>(TLUI_CHART_FORM_CREATE_SERVICE);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  private readonly mnemoPopupChartService = inject(MnemoPopupChartService);
  private readonly mnemoChartService = inject(MnemoChartService);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  public playerModeService = inject(PlayerModeService);
  public viewerService = inject(ViewerService);
  public viewerTagService = inject(ViewerTagService);
  public viewerOMService = inject(ViewerOMService);
  public viewerFormulaService = inject(ViewerFormulaService);

  public form: FormGroup = this.formBuilder.group({
    dataSources: new FormArray<MnemoPopupFormType>([]),
  });

  public get dataSources(): FormArray {
    return this.form.controls.dataSources as FormArray;
  }

  public ngOnInit(): void {
    this.form.valueChanges
      .pipe(debounceTime(1500), takeUntilDestroyed(this))
      .subscribe((v: { dataSources: IMnemoChartPopupForm[] }) => {
        v.dataSources.forEach((item, index) => this.drawChart(item, index));
      });

    this.addDataSource(this.mnemoPopupChartService.firstChartId);

    this.mnemoPopupChartService.tooltipChartData$
      .pipe(
        debounceTime(1500),
        filter((d) => !!d),
        takeUntilDestroyed(this)
      )
      .subscribe((cell) => this.drawChartByTooltip(cell as mxCell));
  }

  public ngOnDestroy(): void {
    this.mnemoPopupChartService.tooltipChartData$.next(null);
    this.mnemoPopupChartService.chartsDataChanged.clear();
    this.mnemoPopupChartService.popupContainer.clear();
    this.dataSources.controls.forEach(() => this.deleteDataSource(0));
    this.popupService.removeOverlay();
  }

  public addDataSource(id?: string): void {
    const groupId = id?.length ? id : uuidGenerate();
    this.mnemoChartService.setChartOptions(this.tluiChartFormCreateService.createDefaultData(), groupId);
    const group = this.formBuilder.group({
      groupId,
      requestForm: this.mnemoFormCreateService.createFormWithType(
        {},
        GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS(true, true, false)
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType({}, GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS()),
      sourceForm: this.mnemoFormCreateService.createFormWithType({}, MNEMO_CHART_DEFAULT_SOURCE_OPTIONS),
    });

    this.dataSources.push(group, { emitEvent: false });

    this.mnemoChartService.setRequestOptions(group.value.requestForm as IMnemoChartRequestOptions, groupId);
    this.mnemoChartService.setViewOptions(group.value.viewForm as IMnemoChartViewOptions, groupId);
  }

  public deleteDataSource(index: number): void {
    const { groupId } = (this.dataSources.controls[0] as MnemoPopupFormType).value;
    this.mnemoChartService.deleteChartOptions(groupId);
    this.mnemoChartService.deleteRequestOptions(groupId);
    this.mnemoChartService.deleteViewOptions(groupId);
    this.mnemoPopupChartService.chartsDataChanged.delete(groupId);
    this.dataSources.removeAt(index, { emitEvent: false });
    this.mnemoPopupChartService.popupContainer.get(groupId)?.overlayRef?.dispose();
  }

  public openSettingPopup(index: number): void {
    const { groupId } = this.dataSources.controls[index].value;
    const { requestForm, sourceForm, viewForm } = (this.dataSources.controls[index] as MnemoPopupFormType).controls;

    const data = {
      chartOptions: this.mnemoChartService.getChartOptions(groupId),
      requestOptions: this.mnemoChartService.getRequestOptions(groupId),
      viewOptions: this.mnemoChartService.getViewOptions(groupId),
    };

    this.popupService
      .open(MnemoChartSettingPopupComponent, data as IMnemoChartSettingModel)
      .popupRef.afterClosed()
      .subscribe((options: IMnemoChartSettingModel) => {
        if (!options || JSON.stringify(options) === JSON.stringify(data)) return;
        if (options?.chartOptions) {
          this.mnemoChartService.setChartOptions(options?.chartOptions ?? data?.chartOptions, groupId);
        }
        this.mnemoChartService.setRequestOptions(options?.requestOptions ?? data?.requestOptions, groupId);
        this.mnemoChartService.setViewOptions(options?.viewOptions ?? data.viewOptions, groupId);
        requestForm.patchValue(options?.requestOptions ?? data?.requestOptions, { emitEvent: false });
        viewForm.patchValue(options?.viewOptions ?? data.viewOptions, { emitEvent: false });
        this.drawChart(
          {
            groupId,
            requestForm: { ...MNEMO_CHART_DEFAULT_REQUEST_OPTIONS, ...options?.requestOptions },
            sourceForm: sourceForm.value as IMnemoChartSourceForm,
            viewForm: { ...MNEMO_CHART_DEFAULT_VIEW_OPTIONS, ...options.viewOptions },
          },
          index,
          true
        );
      });
  }

  public resetStyle(index: number): void {
    const { groupId } = this.dataSources.controls[index].value;
    (this.dataSources.controls[index] as MnemoPopupFormType).controls.sourceForm.patchValue(
      {
        tagNamesString: null,
        omAttrs: null,
        formulas: null,
      },
      { emitEvent: false }
    );
    this.mnemoChartService.setChartOptions(null, groupId);
    this.mnemoChartService.setRequestOptions(null, groupId);
    this.mnemoPopupChartService.popupContainer.get(groupId)?.overlayRef?.dispose();
  }

  private drawChart(item: IMnemoChartPopupForm, index: number, isNeedDelete: boolean = false): void {
    if (
      JSON.stringify(item) === JSON.stringify(this.mnemoPopupChartService.chartsDataChanged.get(item.groupId)?.value) &&
      !isNeedDelete
    ) {
      return;
    }

    if (
      !item.sourceForm?.tagNamesString?.length &&
      !item.sourceForm?.omAttrs?.length &&
      !item.sourceForm?.formulas?.length
    ) {
      return;
    }

    const deleteContainer = (): void => {
      this.mnemoPopupChartService.popupContainer.get(item.groupId)?.overlayRef?.dispose();
      this.mnemoPopupChartService.popupContainer.get(item.groupId)?.overlayRef?.detach();
      this.mnemoPopupChartService.popupContainer.delete(item.groupId);
      this.mnemoPopupChartService.chartsDataChanged.get(item.groupId)?.unsubscribe();
      this.mnemoPopupChartService.chartsDataChanged.delete(item.groupId);
    };

    if (isNeedDelete) {
      deleteContainer();
    }

    if (this.mnemoPopupChartService.popupContainer.get(item.groupId) && !isNeedDelete) {
      this.mnemoPopupChartService.chartsDataChanged.get(item.groupId).next(item);
      return;
    }

    this.mnemoPopupChartService.chartsDataChanged.set(item.groupId, new BehaviorSubject(item));

    const chart = this.popupService.open(
      MnemoChartWrapComponent,
      {
        index,
        chartId: item.groupId,
        item,
        itemChanged$: this.mnemoPopupChartService.chartsDataChanged.get(item.groupId),
      } as IMnemoChartWrapperData,
      {
        width: 840,
        height: 480,
        positions: [{ originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' }],
        hasBackdrop: false,
      }
    );

    this.mnemoPopupChartService.popupContainer.set(item.groupId, chart);

    chart.popupRef.afterClosed().subscribe(() => {
      (this.dataSources.controls[index] as MnemoPopupFormType).controls.sourceForm.patchValue(
        {
          tagNamesString: null,
          omAttrs: null,
          formulas: null,
        },
        { emitEvent: false, onlySelf: true }
      );
      deleteContainer();
    });
  }

  private drawChartByTooltip(cell: Partial<mxCell>): void {
    const group = this.dataSources.controls[0] as MnemoPopupFormType;
    const { sourceForm } = group.controls;
    if (cell.tagName?.length && (cell.sourceType === 'tag' || !cell?.sourceType || cell.sourceType === 'om')) {
      const existTags = sourceForm.value.tagNamesString;
      sourceForm.patchValue(
        {
          tagNamesString: existTags?.length ? [...existTags, cell.tagName] : [cell.tagName],
        },
        {
          emitEvent: false,
        }
      );
    } else if (cell.sourceType === 'omAttr') {
      const existAttrs = sourceForm.value.omAttrs;
      const attr = this.viewerOMService.omObjectMap$.value.get(cell.attrGuid);
      sourceForm.patchValue(
        {
          omAttrs: existAttrs?.length ? [...existAttrs, attr] : [attr],
        },
        {
          emitEvent: false,
        }
      );
    } else if (cell.sourceType === 'formula') {
      const existFormulas = sourceForm.value.formulas;
      const formula = this.viewerFormulaService.formulaObjectMap$.value.get(cell.formula);
      sourceForm.patchValue(
        {
          formulas: existFormulas?.length ? [...existFormulas, formula] : [formula],
        },
        {
          emitEvent: false,
        }
      );
    }

    this.drawChart(group.getRawValue(), 0);
  }
}
