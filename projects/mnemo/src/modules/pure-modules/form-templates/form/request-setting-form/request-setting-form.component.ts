/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormGroupDirective, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective } from '@jsverse/transloco';
import { LANGUAGE, TluiDirectionModule } from '@tl-platform/core';
import {
  TluiAccordionModule,
  TluiCheckboxModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiNumberInputModule,
} from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { MnemoChartRequestFormType } from '../../../../../models';
import { FillPipe } from '../../../../../pipes';

@Component({
  standalone: true,
  selector: 'tl-mnemo-request-setting-form',
  templateUrl: './request-setting-form.component.html',
  styleUrl: './request-setting-form.component.scss',
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
  ],
})
export class MnemoRequestSettingFormComponent implements OnInit {
  public readonly language$ = inject<Observable<string>>(LANGUAGE);
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });

  @Input() public isExpanded: boolean = false;
  public requestForm?: MnemoChartRequestFormType;

  public ngOnInit(): void {
    this.requestForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as MnemoChartRequestFormType;
  }

  public onKeyboardClick(key: KeyboardEvent): void {
    if (key && key?.key === 'Enter') {
      this.onCalendarClose();
    }
  }

  public onCalendarClose(): void {
    this.requestForm.controls.points.patchValue(0);
    this.requestForm.controls.hoursPeriod.patchValue(8);
  }
}
