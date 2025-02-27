/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormGroupDirective, FormGroupName, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TluiAccordionModule, TluiCheckboxModule, TluiFormFieldModule } from '@tl-platform/ui';
import { MultiLineChartFormType } from '../../../../../models';

@Component({
  selector: 'tl-mnemo-multi-line-setting-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiCheckboxModule,
    TluiFormFieldModule,
    NgForOf,
    TranslocoDirective,
  ],
  templateUrl: './multi-line-setting-form.component.html',
  styleUrl: './multi-line-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiLineSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  public optionsForm: MultiLineChartFormType;

  public ngOnInit(): void {
    this.optionsForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as MultiLineChartFormType;
  }
}
