/* eslint-disable import/no-extraneous-dependencies */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatRipple } from '@angular/material/core';
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
  TluiNumberInputModule,
} from '@tl-platform/ui';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { ViewerCoreModule } from '../../pure-modules';
import { MnemoChartModule } from '../mnemo-chart-module';
import {
  MnemoChartFormulaListComponent,
  MnemoChartOmListComponent,
  MnemoChartSelectorComponent,
  MnemoChartTagListComponent,
  MnemoChartUserPointsComponent,
} from './components';
import { MnemoChartPageProviders } from './mnemo-chart-page.providers';

@NgModule({
  declarations: [
    MnemoChartSelectorComponent,
    MnemoChartUserPointsComponent,
    MnemoChartTagListComponent,
    MnemoChartFormulaListComponent,
    MnemoChartOmListComponent,
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
    MnemoChartModule,
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
    TluiCheckboxModule,
  ],
  exports: [MnemoChartSelectorComponent],
  providers: MnemoChartPageProviders,
})
export class MnemoChartPageModule {}
