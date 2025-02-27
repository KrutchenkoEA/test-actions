/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import {
  TluiAccordionModule,
  TluiButtonModule,
  TluiChartComboModule,
  TluiCheckboxModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiLottieAnimationModule,
  TluiNumberInputModule,
  TluiSelectModule,
  TluiSliderModule,
  TluiSpinnerModule,
} from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  MnemoChartSettingFormComponent,
  MnemoRequestSettingFormComponent,
  MnemoTrendSettingFormComponent,
} from '../../pure-modules';
import {
  MnemoChartComponent,
  MnemoChartPrintComponent,
  MnemoChartWrapComponent,
  MnemoPopupChartSelectorComponent,
} from './components';
import { MnemoChartProviders } from './mnemo-chart.providers';

@NgModule({
  declarations: [
    MnemoChartComponent,
    MnemoChartWrapComponent,
    MnemoPopupChartSelectorComponent,
    MnemoChartPrintComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TluiAccordionModule,
    TluiButtonModule,
    TluiChartComboModule,
    TranslocoDirective,
    TranslocoPipe,
    CdkDrag,
    CdkDragHandle,
    SvgIconComponent,
    TluiSelectModule,
    TluiFormFieldModule,
    TluiDirectionModule,
    MatTooltip,
    TluiNumberInputModule,
    TluiCheckboxModule,
    TluiSliderModule,
    TluiDatepickerModule,
    TluiSpinnerModule,
    TluiLottieAnimationModule,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    MnemoRequestSettingFormComponent,
    MnemoChartSettingFormComponent,
    MnemoTrendSettingFormComponent,
  ],
  providers: MnemoChartProviders,
  exports: [MnemoChartComponent, MnemoChartWrapComponent, MnemoPopupChartSelectorComponent, MnemoChartPrintComponent],
})
export class MnemoChartModule {}
