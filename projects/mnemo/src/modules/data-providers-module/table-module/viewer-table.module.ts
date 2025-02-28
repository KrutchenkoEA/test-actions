/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoModule } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import { TluiSvgLoader } from '@tl-platform/icons';
import {
  TluiButtonModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiLineChartModule,
  TluiLottieAnimationModule,
  TluiMenuModule,
  TluiNumberInputModule,
  TluiSelectModule,
  TluiSpinnerModule,
  TluiTooltipModule,
} from '@tl-platform/ui';
import { AngularSplitModule } from 'angular-split';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { FillPipe } from '../../../pipes';
import { PopupService, StyleService } from '../../../services';
import { ViewerEventLegendComponent } from '../../additional-modules';
import { ManualTagModalComponent, ViewerCoreModule } from '../../pure-modules';
import { ViewerPopupChartToolbarComponent } from './viewer-popup-chart-toolbar/viewer-popup-chart-toolbar.component';
import { ViewerPopupChartComponent } from './viewer-popup-chart/viewer-popup-chart.component';
import { ViewerPopupChartService } from './viewer-popup-chart/viewer-popup-chart.service';
import { TableRuleService } from './viewer-table/table-rule.service';
import { TableService } from './viewer-table/table.service';
import { ViewerTableComponent } from './viewer-table/viewer-table.component';

const tableProviders = [ViewerPopupChartService, TableService, TableRuleService];

@NgModule({
  declarations: [ViewerTableComponent, ViewerPopupChartToolbarComponent, ViewerPopupChartComponent],
  exports: [ViewerTableComponent, ViewerPopupChartToolbarComponent, ViewerPopupChartComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useClass: TluiSvgLoader,
      },
    }),
    ViewerCoreModule,
    AngularSplitModule,
    MatTooltip,
    CdkDragHandle,
    CdkDrag,
    TluiTooltipModule,
    TluiMenuModule,
    TluiDirectionModule,
    TluiDatepickerModule,
    TluiFormFieldModule,
    TluiNumberInputModule,
    TluiButtonModule,
    TluiSelectModule,
    TluiLineChartModule,
    TluiSpinnerModule,
    TluiLottieAnimationModule,
    ManualTagModalComponent,
    FillPipe,
    ViewerEventLegendComponent,
  ],
  providers: [StyleService, PopupService, ...tableProviders, provideHttpClient(withInterceptorsFromDi())],
})
export class ViewerTableModule {
}
