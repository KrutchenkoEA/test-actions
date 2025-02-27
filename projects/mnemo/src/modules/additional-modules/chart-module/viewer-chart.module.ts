/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import { TluiSvgLoader } from '@tl-platform/icons';
import {
  TluiAccordionModule,
  TluiButtonModule,
  TluiCheckboxModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiLineChartModule,
  TluiLottieAnimationModule,
  TluiNumberInputModule,
  TluiRadioModule,
  TluiSelectModule,
  TluiSpinnerModule,
} from '@tl-platform/ui';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { ViewerCoreModule } from '../../pure-modules';
import { ChartProviders } from './chart-providers';
import {
  ChartComponent,
  ChartPrintComponent,
  ChartSettingComponent,
  ChartWrapComponent,
  PopupChartSelectorComponent,
} from './components';
import { SortViewerChartDataPipe } from './pipes';

/**  @deprecated use MnemoChartModule */
@NgModule({
  declarations: [
    ChartComponent,
    ChartSettingComponent,
    SortViewerChartDataPipe,
    PopupChartSelectorComponent,
    ChartWrapComponent,
    ChartPrintComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useClass: TluiSvgLoader,
      },
    }),
    OverlayModule,
    ViewerCoreModule,
    TluiFormFieldModule,
    TluiDirectionModule,
    TluiNumberInputModule,
    TranslocoDirective,
    MatTooltip,
    TluiSelectModule,
    CdkDragHandle,
    CdkDrag,
    TluiCheckboxModule,
    TluiRadioModule,
    TluiDatepickerModule,
    TluiAccordionModule,
    TranslocoPipe,
    TluiButtonModule,
    TluiSpinnerModule,
    TluiLineChartModule,
    TluiLottieAnimationModule,
  ],
  exports: [
    ChartComponent,
    ChartSettingComponent,
    SortViewerChartDataPipe,
    PopupChartSelectorComponent,
    ChartWrapComponent,
    ChartPrintComponent,
  ],
  providers: ChartProviders,
})
export class ViewerChartModule {
}
