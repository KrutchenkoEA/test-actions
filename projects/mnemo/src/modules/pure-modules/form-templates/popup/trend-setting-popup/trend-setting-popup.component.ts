/* eslint-disable import/no-extraneous-dependencies */
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { CdkFixedSizeVirtualScroll, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy, TluiDirectionModule } from '@tl-platform/core';
import {
  getLineDefaultCommon,
  getLineDefaultInputs,
  ITluiChartDataLayerLineInputs,
  ITluiChartSingleLayerInputModel,
  TluiAccordionModule,
  TluiButtonModule,
  TluiChartDataLayerCommonInputs,
  TluiCheckboxModule,
} from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { saveAs } from 'file-saver';
import {
  GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
  MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
  popup,
} from '../../../../../consts';
import {
  IMnemoCharDataForSave,
  IMnemoChartRequestOptions,
  IMnemoChartTrendSettingModel,
  IMnemoChartViewOptions,
  ToFormControlType,
} from '../../../../../models';
import { MnemoFormCreateService, MnemoLoggerService, POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import { MnemoRequestSettingFormComponent } from '../../form/request-setting-form/request-setting-form.component';
import { MnemoTrendSettingFormComponent } from '../../form/trend-setting-form/trend-setting-form.component';
import { MnemoViewSettingFormComponent } from '../../form/view-setting-form/view-setting-form.component';
import { MnemoOptionsFormBaseDirective } from '../../mnemo-options-base.directive';

type TrendSettingOptionsFormType = FormGroup<{
  config: FormGroup<ToFormControlType<ITluiChartDataLayerLineInputs>>;
  common: FormGroup<ToFormControlType<TluiChartDataLayerCommonInputs>>;
}>;

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-trend-setting-popup',
  templateUrl: './trend-setting-popup.component.html',
  styleUrls: ['./trend-setting-popup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
  imports: [
    ReactiveFormsModule,
    SvgIconComponent,
    CdkDragHandle,
    CdkDrag,
    DatePipe,
    MnemoRequestSettingFormComponent,
    MnemoTrendSettingFormComponent,
    MnemoViewSettingFormComponent,
    CdkVirtualScrollViewport,
    CdkFixedSizeVirtualScroll,
    MatTooltip,
    TranslocoDirective,
    TranslocoPipe,
    TluiAccordionModule,
    TluiButtonModule,
    TluiCheckboxModule,
    TluiDirectionModule,
  ],
})
export class MnemoTrendSettingPopupComponent
  extends MnemoOptionsFormBaseDirective<TrendSettingOptionsFormType>
  implements OnInit {
  public data = inject<IMnemoChartTrendSettingModel>(POPUP_DIALOG_DATA);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  private readonly popupRef = inject<PopupReference<MnemoTrendSettingPopupComponent>>(PopupReference);
  private readonly formBuilder = inject(FormBuilder);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      requestControl: this.data?.isSeparateTrend ?? false,
      requestForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartRequestOptions>(
        this.data.requestOptions,
        MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartViewOptions>(
        this.data?.viewOptions,
        MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
      ),
      optionsForm: this.createTrendOptionsForm(this.data.trendOptions),
    });

    super.ngOnInit();
  }

  public onSave(): void {
    this.popupRef.close({
      trendSetting: this.optionsForm.getRawValue(),
      requestSetting: this.requestForm.getRawValue(),
      isSeparateTrend: this.requestControl.getRawValue(),
    } as unknown as IMnemoChartTrendSettingModel);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onReset(): void {
    this.requestControl.patchValue(false);
    this.requestForm.patchValue(GET_MNEMO_CHART_DEFAULT_REQUEST_OPTIONS());
    this.optionsForm.patchValue({ config: null, common: null });
  }

  public onDownload(): void {
    const obj: IMnemoCharDataForSave = {
      name: this.data.trendName,
      date: this.requestForm.controls.date.value,
      points: this.requestForm.controls.points.value,
      data: this.data.chartData,
    };
    try {
      const file = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      saveAs(file, `${obj.name}:${obj.date.start.toLocaleDateString()}-${obj.date.end.toLocaleDateString()}.json`);
    } catch (e) {
      this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    }
  }

  public onCopy(): void {
    navigator.clipboard.writeText(this.data.chartData.toString());
    this.mnemoLoggerService.catchMessage('info', 'mnemo.ChartSettingComponent.copiedToBuffer');
  }

  private createTrendOptionsForm(data: ITluiChartSingleLayerInputModel['lineLayer']): TrendSettingOptionsFormType {
    return this.formBuilder.group({
      config: this.mnemoFormCreateService.createFormWithType<ITluiChartDataLayerLineInputs>(
        data?.config,
        getLineDefaultInputs(),
      ),
      common: this.mnemoFormCreateService.createFormWithType<TluiChartDataLayerCommonInputs>(
        data?.common,
        getLineDefaultCommon(),
      ),
    });
  }
}
