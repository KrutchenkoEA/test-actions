/* eslint-disable import/no-extraneous-dependencies */
import { OverlayModule } from '@angular/cdk/overlay';
import { CdkTreeModule } from '@angular/cdk/tree';
import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import { TluiSvgLoader } from '@tl-platform/icons';
import {
  TluiButtonModule,
  TluiCheckboxModule,
  TluiFormFieldModule,
  TluiLottieAnimationModule,
  TluiSelectModule,
  TluiSpinnerModule,
} from '@tl-platform/ui';
import { AngularSplitModule } from 'angular-split';
import { AngularSvgIconModule, SvgLoader } from 'angular-svg-icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { MnemoLoggerService, RtdbTagApiService } from '../../../services';
import { ObjectsListWrapperComponent } from './objects-list-wrapper/objects-list-wrapper.component';
import { ObjectsTreeComponent } from './objects-tree/objects-tree.component';
import { OmTagFormComponent } from './om-tag-form/om-tag-form.component';
import { OmTagModalComponent } from './om-tag-modal.component';
import { OmTreeService } from './om-tree.service';
import { ShapePreviewTooltipComponent } from './shape-preview-tooltip/shape-preview-tooltip.component';
import { ShapePreviewTooltipDirective } from './shape-preview-tooltip/shape-preview-tooltip.directive';
import { TagsTableComponent } from './tags-table/tags-table.component';

@NgModule({
  declarations: [
    OmTagModalComponent,
    ObjectsTreeComponent,
    OmTagFormComponent,
    TagsTableComponent,
    ObjectsListWrapperComponent,
    ShapePreviewTooltipDirective,
    ShapePreviewTooltipComponent,
  ],
  exports: [
    OmTagModalComponent,
    ObjectsTreeComponent,
    OmTagFormComponent,
    TagsTableComponent,
    ObjectsListWrapperComponent,
    ShapePreviewTooltipDirective,
    ShapePreviewTooltipComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    NgxSkeletonLoaderModule,
    TranslocoModule,
    TluiFormFieldModule,
    TluiButtonModule,
    TluiSelectModule,
    TluiDirectionModule,
    AngularSvgIconModule.forRoot({
      loader: {
        provide: SvgLoader,
        useClass: TluiSvgLoader,
      },
    }),
    CdkTreeModule,
    TluiCheckboxModule,
    TluiSpinnerModule,
    TluiLottieAnimationModule,
    AngularSplitModule,
  ],
  providers: [OmTreeService, RtdbTagApiService, MnemoLoggerService, provideHttpClient(withInterceptorsFromDi())],
})
export class OmTagModalModule {
}
