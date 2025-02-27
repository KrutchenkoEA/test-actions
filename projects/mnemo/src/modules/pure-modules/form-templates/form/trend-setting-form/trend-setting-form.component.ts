/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective, FormGroupName, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import {
  ITluiChartDataLayerLineInputs,
  TLUI_CHART_LINE_INTERPOLATE,
  TLUI_CHART_POINT_MARKERS,
  TLUI_CHART_POINT_MARKERS_CONFIG,
  TluiAccordionModule,
  TluiChartDataLayerCommonInputs,
  TluiCheckboxModule,
  TluiFormFieldModule,
  TluiNumberInputModule,
  TluiSliderModule,
} from '@tl-platform/ui';
import { ToFormControlType } from '../../../../../models';

type TrendSettingOptionsFormType = FormGroup<{
  config: FormGroup<ToFormControlType<ITluiChartDataLayerLineInputs>>;
  common: FormGroup<ToFormControlType<TluiChartDataLayerCommonInputs>>;
}>;

@Component({
  selector: 'tl-mnemo-trend-setting-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    TluiAccordionModule,
    TluiCheckboxModule,
    TluiFormFieldModule,
    TluiSliderModule,
    TranslocoDirective,
    TluiDirectionModule,
    TluiNumberInputModule,
  ],
  templateUrl: './trend-setting-form.component.html',
  styleUrl: './trend-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoTrendSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  @Input() public isExpanded: boolean = false;
  public optionsForm: TrendSettingOptionsFormType;
  protected readonly interpolation = TLUI_CHART_LINE_INTERPOLATE;
  protected readonly dataMarkers = TLUI_CHART_POINT_MARKERS_CONFIG;
  protected readonly markers = TLUI_CHART_POINT_MARKERS;

  public ngOnInit(): void {
    this.optionsForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as TrendSettingOptionsFormType;
  }
}
