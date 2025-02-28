/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import { TluiSvgLoader } from '@tl-platform/icons';
import {
  TluiAccordionModule,
  TluiButtonModule,
  TluiChartComboModule,
  TluiCheckboxModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiLottieAnimationModule,
  TluiNumberInputModule,
  TluiSliderModule,
  TluiSpinnerModule,
} from '@tl-platform/ui';
import { AngularSplitModule } from 'angular-split';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MnemoFormCreateService, PopupService, StyleService } from '../../../../services';
import { MnemoChartModule, ViewerEventLegendComponent } from '../../../additional-modules';
import { ViewerCoreModule } from '../../../pure-modules';
import { MnemoProviders } from './mnemo-providers';
import { ViewerMnemoComponent } from './viewer-mnemo.component';

@NgModule({
  declarations: [ViewerMnemoComponent],
  exports: [ViewerMnemoComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AngularSplitModule,
    TranslocoModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useClass: TluiSvgLoader,
      },
    }),
    NgxSkeletonLoaderModule,
    TluiLottieAnimationModule,
    ViewerCoreModule,
    MnemoChartModule,
    TluiSpinnerModule,
    CdkDrag,
    CdkDragHandle,
    TluiAccordionModule,
    TluiButtonModule,
    TluiChartComboModule,
    TluiCheckboxModule,
    TluiDatepickerModule,
    TluiDirectionModule,
    TluiFormFieldModule,
    TluiNumberInputModule,
    TluiSliderModule,
    ViewerEventLegendComponent,
  ],
  providers: [
    StyleService,
    PopupService,
    MnemoFormCreateService,
    ...MnemoProviders,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class ViewerMnemoModule {}
