/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TluiButtonModule, TluiCheckboxModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
  popup,
} from '../../../../../consts';
import {
  IMnemoChartRequestOptions,
  IMnemoChartRequestSettingModel,
  IMnemoChartViewOptions,
} from '../../../../../models';
import { MnemoFormCreateService, POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import { MnemoRequestSettingFormComponent } from '../../form/request-setting-form/request-setting-form.component';
import { MnemoViewSettingFormComponent } from '../../form/view-setting-form/view-setting-form.component';
import { MnemoOptionsFormBaseDirective } from '../../mnemo-options-base.directive';

@Component({
  standalone: true,
  selector: 'tl-mnemo-request-setting-popup',
  templateUrl: './request-setting-popup.component.html',
  styleUrl: './request-setting-popup.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    CdkDragHandle,
    CdkDrag,
    MnemoRequestSettingFormComponent,
    MnemoViewSettingFormComponent,
    TranslocoDirective,
    TranslocoPipe,
    TluiButtonModule,
    TluiCheckboxModule,
  ],
})
export class MnemoRequestSettingPopupComponent extends MnemoOptionsFormBaseDirective<null> implements OnInit {
  public data = inject<IMnemoChartRequestSettingModel>(POPUP_DIALOG_DATA);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  private readonly popupRef = inject<PopupReference<MnemoRequestSettingPopupComponent>>(PopupReference);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    // @ts-ignore
    this.formGroup = this.formBuilder.group({
      requestControl: !!this.data?.requestOptions,
      requestForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartRequestOptions>(
        this.data?.requestOptions,
        MNEMO_CHART_DEFAULT_REQUEST_OPTIONS
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartViewOptions>(
        this.data?.viewOptions,
        MNEMO_CHART_DEFAULT_VIEW_OPTIONS
      ),
      optionsForm: null,
    });

    super.ngOnInit();
  }

  public onSave(): void {
    this.popupRef.close({
      requestOptions: this.requestControl?.value ? this.requestForm.getRawValue() : null,
      viewOptions: this.viewForm.value,
    } as IMnemoChartRequestSettingModel);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onReset(): void {
    this.requestControl.patchValue(false);
    this.requestForm.patchValue(GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS());
  }
}
