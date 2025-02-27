/* eslint-disable import/no-extraneous-dependencies */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { TluiSvgLoader } from '@tl-platform/icons';
import {
  TluiAccordionModule,
  TluiButtonModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiNumberInputModule,
} from '@tl-platform/ui';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatRipple } from '@angular/material/core';
import {
  ChartFormulaListComponent,
  ChartOmListComponent,
  ChartSelectorComponent,
  ChartTagListComponent,
  ChartUserPointsComponent,
} from './components';
import { ViewerCoreModule } from '../../pure-modules';
import { ChartPageAddService, ChartPageDataService } from './services';
import { ViewerChartModule } from '../chart-module';

/**  @deprecated use MnemoChartPageModule */
@NgModule({
  declarations: [
    ChartSelectorComponent,
    ChartUserPointsComponent,
    ChartTagListComponent,
    ChartFormulaListComponent,
    ChartOmListComponent,
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
    ViewerCoreModule,
    ViewerChartModule,
    TranslocoDirective,
    MatRipple,
    TluiDirectionModule,
    TluiButtonModule,
    MatTooltip,
    TranslocoPipe,
    TluiAccordionModule,
    TluiFormFieldModule,
    TluiDatepickerModule,
    TluiNumberInputModule,
  ],
  exports: [ChartSelectorComponent],
  providers: [ChartPageAddService, ChartPageDataService],
})
export class ViewerChartPageModule {
}
