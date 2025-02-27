/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormGroupDirective, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import {
  TluiAccordionModule,
  TluiButtonModule,
  TluiCheckboxModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiNumberInputModule,
} from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { MnemoChartViewFormType } from '../../../../../models';
import { FillPipe } from '../../../../../pipes';

@Component({
  standalone: true,
  selector: 'tl-mnemo-view-setting-form',
  templateUrl: './view-setting-form.component.html',
  styleUrl: './view-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiCheckboxModule,
    TluiDatepickerModule,
    TluiDirectionModule,
    TluiNumberInputModule,
    TluiFormFieldModule,
    TranslocoDirective,
    MatTooltip,
    SvgIconComponent,
    FillPipe,
    TluiButtonModule,
  ],
})
export class MnemoViewSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  @Input() public isExpanded: boolean = false;
  @Input() public isShowMaxSelectedTrend: boolean = true;
  @Input() public isShowAutoZoom: boolean = false;
  @Input() public isShowExponent: boolean = true;
  public viewForm?: MnemoChartViewFormType;

  public ngOnInit(): void {
    this.viewForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as MnemoChartViewFormType;
  }

  public getAutoZoomAxisActiveState(index: number): boolean {
    return this.viewForm.value.autoZoomAxisActiveState?.[`xy${index}`];
  }

  public setAutoZoomAxisActiveState(index: number): void {
    const valueObject = this.viewForm.value?.autoZoomAxisActiveState;
    const currentValue = valueObject[`xy${index}`] ?? false;
    valueObject[`xy${index}`] = !currentValue;
    this.viewForm.controls.autoZoomAxisActiveState.patchValue(valueObject);
  }

  public setAutoZoomAxisActiveStateAll(value: boolean): void {
    const valueObject = this.viewForm.value?.autoZoomAxisActiveState;
    Object.keys(valueObject)?.forEach((key: string) => {
      valueObject[key] = value;
    });
    this.viewForm.controls.autoZoomAxisActiveState.patchValue(valueObject);
  }
}
