/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormGroupDirective, FormGroupName, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TluiAccordionModule, TluiCheckboxModule, TluiFormFieldModule, TluiSliderModule } from '@tl-platform/ui';
import { PieChartFormType } from '../../../../../models';

@Component({
  selector: 'tl-mnemo-pie-setting-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiSliderModule,
    TluiCheckboxModule,
    TluiFormFieldModule,
    TranslocoDirective,
    NgForOf,
  ],
  templateUrl: './pie-setting-form.component.html',
  styleUrl: './pie-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoPieSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  public optionsForm: PieChartFormType;

  public ngOnInit(): void {
    this.optionsForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as PieChartFormType;
  }
}
