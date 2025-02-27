/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core';
import { FormGroupDirective, FormGroupName, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed, ThemeConfiguratorService } from '@tl-platform/core';
import {
  IOptionsFormType,
  TluiAccordionModule,
  TluiChartComboModule,
  TluiCheckboxModule,
  TluiFormFieldModule,
  TluiSliderModule,
} from '@tl-platform/ui';
import { MnemoTrendSettingFormComponent } from '../trend-setting-form/trend-setting-form.component';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-setting-form',
  standalone: true,
  imports: [
    FormsModule,
    NgForOf,
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiChartComboModule,
    TluiCheckboxModule,
    TluiFormFieldModule,
    TluiSliderModule,
    TranslocoDirective,
    MnemoTrendSettingFormComponent,
  ],
  templateUrl: './chart-setting-form.component.html',
  styleUrl: './chart-setting-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartSettingFormComponent implements OnInit {
  private readonly parentForm = inject(FormGroupDirective);
  public formGroupName = inject(FormGroupName, { optional: true });
  private readonly themeService = inject(ThemeConfiguratorService);

  @Input() public showLineSettings: boolean = true;
  @Input() public showBarSettings: boolean = true;
  public optionsForm: IOptionsFormType;
  public isDarkTheme: boolean = true;

  public ngOnInit(): void {
    this.themeService.isDarkTheme.pipe(takeUntilDestroyed(this)).subscribe((value) => {
      this.isDarkTheme = value;
    });

    this.optionsForm = (
      this.formGroupName?.name ? this.parentForm.form.controls[this.formGroupName.name] : this.parentForm.form
    ) as IOptionsFormType;

    if (this.optionsForm.controls.legend.value.legendType === 'simple-style') {
      this.optionsForm.controls.legend.controls.legendLayer.disable();
      this.optionsForm.controls.legend.controls.legendAxis.disable();
    }
  }
}
