/* eslint-disable import/no-extraneous-dependencies */
import { Direction } from '@angular/cdk/bidi';
import { Injectable, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { Subject } from 'rxjs';
import {
  GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
  MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
} from '../../../../consts';
import {
  IFormulaObjectChart,
  IMnemoChartRequestOptions,
  IMnemoChartViewOptions,
  IOmObjectChart,
  ITagObjectChart,
  ToFormControlType,
} from '../../../../models';
import { MnemoChartWrapService } from '../../mnemo-chart-module/services';

@DecorateUntilDestroy()
@Injectable()
export class MnemoChartPageDataService {
  private readonly formBuilder = inject(FormBuilder);
  mnemoChartWrapService = inject(MnemoChartWrapService);

  public activeTagMap: Map<number, ITagObjectChart> = new Map();
  public activeOmAttrMap: Map<number, IOmObjectChart> = new Map();
  public activeFormulaAttrMap: Map<number, IFormulaObjectChart> = new Map();

  public currentDirection: Direction = 'ltr';

  public clearSelection$: Subject<null> = new Subject<null>();

  public reSelectTags$: Subject<{ tagName: string }[]> = new Subject<{ tagName: string }[]>();
  public reSelectOmAttr$: Subject<IOmObjectChart[]> = new Subject<IOmObjectChart[]>();
  public reSelectFormulas$: Subject<{ name: string }[]> = new Subject<{ name: string }[]>();

  public requestForm: FormGroup<ToFormControlType<IMnemoChartRequestOptions>>;
  public viewForm: FormGroup<ToFormControlType<IMnemoChartViewOptions>>;

  constructor() {
    this.requestForm = this.formBuilder.group(GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS(false, true)) as FormGroup<
      ToFormControlType<IMnemoChartRequestOptions>
    >;
    this.viewForm = this.formBuilder.group(GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS()) as FormGroup<
      ToFormControlType<IMnemoChartViewOptions>
    >;
  }

  public getSelectedTags(): ITagObjectChart[] {
    const selectedArr: ITagObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeTagMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public getSelectedOmAttr(): IOmObjectChart[] {
    const selectedArr: IOmObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeOmAttrMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public getSelectedFormula(): IFormulaObjectChart[] {
    const selectedArr: IFormulaObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeFormulaAttrMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public drawChart(isNeedLoader: boolean = true): void {
    const tags = this.getSelectedTags();
    const omAttributes = this.getSelectedOmAttr();
    const formulas = this.getSelectedFormula();

    if (!tags?.length && !omAttributes?.length && !formulas?.length) {
      return;
    }

    if (isNeedLoader) {
      this.mnemoChartWrapService.chartWrapLoading$.next(true);
    }

    this.mnemoChartWrapService.chartWrapData$.next({
      tags,
      omAttributes,
      formulas,
      date:
        this.requestForm.value?.date?.start && this.requestForm.value?.date?.end
          ? this.requestForm.value?.date
          : {
              start: new Date(
                new Date().setHours(
                  new Date().getHours() -
                    (this.requestForm.value?.hoursPeriod ?? MNEMO_CHART_DEFAULT_REQUEST_OPTIONS.hoursPeriod)
                )
              ),
              end: new Date(),
            },
      points: this.requestForm.controls.points.value,
      hoursPeriod: this.requestForm.controls.hoursPeriod.value,
      scale: this.requestForm.controls.scale.value,
      intervalsCount: this.requestForm.controls.intervalsCount.value,
      maxSelectedTrend: this.viewForm.controls.maxSelectedTrend.value,
    });
  }

  public resetRequestForm(): void {
    this.requestForm.patchValue(GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS());
    this.viewForm.patchValue(GET_MNEMO_CHART_DEFAULT_VIEW_OPTIONS());
  }
}
