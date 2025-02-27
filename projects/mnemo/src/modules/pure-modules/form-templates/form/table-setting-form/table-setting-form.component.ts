/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, FormGroupName, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { TluiAccordionModule, TluiCheckboxModule, TluiFormFieldModule, TluiSliderModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { TableChartFormType } from '../../../../../models';

@Component({
  selector: 'tl-mnemo-table-setting-form',
  standalone: true,
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiCheckboxModule,
    TluiSliderModule,
    TluiFormFieldModule,
    SvgIconComponent,
    NgForOf,
  ],
  templateUrl: './table-setting-form.component.html',
  styleUrl: './table-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  public isAddMode: boolean = false;
  public customKeys: string[] = [];
  public optionsForm: TableChartFormType;

  public ngOnInit(): void {
    this.optionsForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as TableChartFormType;
  }

  public addDataSource(): void {
    if (!this.isAddMode) {
      this.toggleSourceForm();
      return;
    }

    if (this.optionsForm.controls.keyForm.value?.length && this.optionsForm.controls.nameForm.value?.length) {
      this.optionsForm.controls.keyNameCustom.addControl(
        this.optionsForm.controls.keyForm.value,
        new FormControl(this.optionsForm.controls.nameForm.value)
      );
      this.customKeys.push(this.optionsForm.controls.keyForm.value);
    }
    this.toggleSourceForm();
  }

  private toggleSourceForm(): void {
    this.optionsForm.controls.keyForm.patchValue(null, { emitEvent: false, onlySelf: true });
    this.optionsForm.controls.nameForm.patchValue(null, { emitEvent: false, onlySelf: true });
    this.isAddMode = !this.isAddMode;
  }
}
