/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy } from '@tl-platform/core';
import {
  IOptionsFormType,
  TLUI_CHART_FORM_CREATE_SERVICE,
  TluiButtonModule,
  TluiChartFormCreateService,
  TluiCheckboxModule,
} from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
  popup,
} from '../../../../../consts';
import { IMnemoChartRequestOptions, IMnemoChartSettingModel, IMnemoChartViewOptions } from '../../../../../models';
import { MnemoFormCreateService, POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import { MnemoChartSettingFormComponent } from '../../form/chart-setting-form/chart-setting-form.component';
import { MnemoRequestSettingFormComponent } from '../../form/request-setting-form/request-setting-form.component';
import { MnemoViewSettingFormComponent } from '../../form/view-setting-form/view-setting-form.component';
import { MnemoOptionsFormBaseDirective } from '../../mnemo-options-base.directive';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-chart-setting-popup',
  templateUrl: './chart-setting-popup.component.html',
  styleUrls: ['./chart-setting-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    CdkDragHandle,
    CdkDrag,
    MnemoChartSettingFormComponent,
    MnemoRequestSettingFormComponent,
    MnemoViewSettingFormComponent,
    TranslocoDirective,
    TranslocoPipe,
    TluiButtonModule,
    TluiCheckboxModule,
  ],
})
export class MnemoChartSettingPopupComponent extends MnemoOptionsFormBaseDirective<IOptionsFormType> implements OnInit {
  public data = inject<IMnemoChartSettingModel>(POPUP_DIALOG_DATA);
  private readonly tluiChartFormCreateService = inject<TluiChartFormCreateService>(TLUI_CHART_FORM_CREATE_SERVICE);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  private readonly popupRef = inject<PopupReference<MnemoChartSettingPopupComponent>>(PopupReference);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      requestControl: !!this.data?.requestOptions,
      requestForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartRequestOptions>(
        this.data.requestOptions,
        MNEMO_CHART_DEFAULT_REQUEST_OPTIONS
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartViewOptions>(
        this.data?.viewOptions,
        MNEMO_CHART_DEFAULT_VIEW_OPTIONS
      ),
      optionsForm: this.data?.chartOptions
        ? this.tluiChartFormCreateService.createSettingForm(this.data.chartOptions)
        : this.tluiChartFormCreateService.createSettingFormDefault(),
    });
    if (!this.data?.requestOptions) {
      this.requestForm.disable();
    }

    super.ngOnInit();
  }

  public onSave(): void {
    this.popupRef.close({
      chartOptions: this.optionsForm.dirty ? this.optionsForm.getRawValue() : null,
      requestOptions: this.requestControl?.value && this.requestForm.dirty ? this.requestForm.getRawValue() : null,
      viewOptions: this.viewForm.getRawValue(),
    } as IMnemoChartSettingModel);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onReset(): void {
    this.requestControl.patchValue(false);
    this.requestForm.patchValue(GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS());
    this.tluiChartFormCreateService.patchSettingForm(this.tluiChartFormCreateService.createDefaultData());
  }
}
