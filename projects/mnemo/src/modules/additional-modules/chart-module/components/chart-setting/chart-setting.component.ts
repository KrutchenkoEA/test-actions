/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, LANGUAGE } from '@tl-platform/core';
import { TluiLCLineInputData } from '@tl-platform/ui';
import { saveAs } from 'file-saver';
import { Observable } from 'rxjs';
import { popup } from '../../../../../consts';
import {
  IVCLayer,
  IVCLayerDataLine,
  IVCLineSaveData,
  IVCSettingsPopup,
  IViewerChartModels,
} from '../../../../../models';
import { MnemoLoggerService, POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';
import { ChartService } from '../../services';

/**  @deprecated use MnemoChartModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-setting',
  templateUrl: './chart-setting.component.html',
  styleUrls: ['./chart-setting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
})
export class ChartSettingComponent implements OnInit {
  readonly language$ = inject<Observable<string>>(LANGUAGE);
  readonly data = inject<{
    chartOpt: IViewerChartModels;
    layerOpt: IVCLayer[];
    trendOpt: IVCLayerDataLine;
    reqOpt: IVCSettingsPopup;
    isGroup?: boolean;
    maxSelectedCount?: number;
  }>(POPUP_DIALOG_DATA);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupRef = inject<PopupReference<ChartSettingComponent>>(PopupReference);
  private readonly cdr = inject(ChangeDetectorRef);
  public chartService = inject(ChartService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public chartForm: FormGroup;
  public layerForm: FormGroup;
  public trendForm: FormGroup;
  public reqOpt: FormGroup;
  public maxSelectedCount = new FormControl(3);

  public chartData: TluiLCLineInputData[] = [];
  public date: { dateFrom: Date; dateTo: Date };
  public pointsCount: number = 0;
  public isGroup: boolean = false;

  public get layerFormSource(): FormArray {
    return this.layerForm.controls.layerFormSource as FormArray;
  }

  public ngOnInit(): void {
    if (this.data?.chartOpt) {
      this.chartForm = this.formBuilder.group({
        tooltip: this.data.chartOpt?.viewOptions?.tooltip,
        tooltipType: this.data.chartOpt?.viewOptions?.tooltipType,
        tooltipMarkerType: this.data.chartOpt?.viewOptions?.tooltipMarkerType,
        tooltipMarkerCrossSize: this.data.chartOpt?.viewOptions?.tooltipMarkerCrossSize,
        tooltipColor: this.data.chartOpt?.viewOptions?.tooltipColor,
        tooltipWidth: this.data.chartOpt?.viewOptions?.tooltipWidth,

        legend: this.data.chartOpt?.viewOptions?.legend,

        zoomType: this.data.chartOpt?.viewOptions?.zoomType,
        zoomXEnable: this.data.chartOpt?.viewOptions?.zoomXEnable,
        zoomYEnable: this.data.chartOpt?.viewOptions?.zoomYEnable,

        marginLeft: this.data.chartOpt?.viewOptions?.marginLeft,
        marginRight: this.data.chartOpt?.viewOptions?.marginRight,
        marginBottom: this.data.chartOpt?.viewOptions?.marginBottom,
        marginTop: this.data.chartOpt?.viewOptions?.marginTop,

        smartScrollEnable: this.data?.chartOpt?.viewOptions?.smartScrollEnable,
        smartScrollHeight: this.data?.chartOpt?.viewOptions?.smartScrollHeight,
        smartScrollColor: this.data?.chartOpt?.viewOptions?.smartScrollColor,

        interpolateEnable: this.data?.chartOpt?.viewOptions?.interpolateEnable,
      });
    }
    if (this.data?.layerOpt?.length) {
      this.layerForm = this.formBuilder.group({
        layerFormSource: new FormArray(
          this.data.layerOpt.map((d) => {
            return this.formBuilder.group({
              axisX: this.formBuilder.group({
                type: d.layerViewOptions.axisX.type,
                position: d.layerViewOptions.axisX.position,
                // min: d.layerViewOptions.axisX.min,
                // max: d.layerViewOptions.axisX.max,
                ticks: d.layerViewOptions.axisX.ticks,
                color: d.layerViewOptions.axisX.color,
                primary: d.layerViewOptions.axisX.primary,
                textColor: d.layerViewOptions.axisX.textColor,
              }),
              axisY: this.formBuilder.group({
                type: d.layerViewOptions.axisY.type,
                position: d.layerViewOptions.axisY.position,
                // min: d.layerViewOptions.axisY.min,
                // max: d.layerViewOptions.axisY.max,
                ticks: d.layerViewOptions.axisY.ticks,
                color: d.layerViewOptions.axisY.color,
                primary: d.layerViewOptions.axisY.primary,
                textColor: d.layerViewOptions.axisY.textColor,
              }),
              gridX: this.formBuilder.group({
                color: d.layerViewOptions.gridX.color,
              }),
              gridY: this.formBuilder.group({
                color: d.layerViewOptions.gridY.color,
              }),
            });
          }),
        ),
      });
    }
    if (this.data?.trendOpt) {
      this.trendForm = this.formBuilder.group({
        lineDynamics: this.data.trendOpt.layerDataViewOptions.lineDynamics,
        lineType: this.data.trendOpt.layerDataViewOptions.lineType,
        lineOpacity: this.data.trendOpt.layerDataViewOptions.lineOpacity,
        lineWidth: this.data.trendOpt.layerDataViewOptions.lineWidth,
        dataPointType: this.data.trendOpt.layerDataViewOptions.dataPointType,
        dataPointColor: this.data.trendOpt.layerDataViewOptions.dataPointColor,
        breakPointType: this.data.trendOpt.layerDataViewOptions.breakPointType,
        breakPoint: this.data.trendOpt.layerDataViewOptions.breakPoint,
        breakPointColor: this.data.trendOpt.layerDataViewOptions.breakPointColor,
        breakPointSize: this.data.trendOpt.layerDataViewOptions.breakPointSize,
        breakPointLimit: this.data.trendOpt.layerDataViewOptions.breakPointLimit,
        breakPointMarker: this.data.trendOpt.layerDataViewOptions.breakPointMarker,
        endPoint: this.data.trendOpt.layerDataViewOptions.endPoint,
        endPointSize: this.data.trendOpt.layerDataViewOptions.endPointSize,
        endPointStrokeSize: this.data.trendOpt.layerDataViewOptions.endPointStrokeSize,
        showValues: this.data.trendOpt.layerDataViewOptions.showValues,
        caption: this.data.trendOpt.layerDataViewOptions.caption,
        engUnits: this.data.trendOpt.layerDataViewOptions.engUnits,
        interpolateEnable: this.data.trendOpt.layerDataViewOptions.interpolateEnable,
        extendStep: this.data.trendOpt.layerDataViewOptions.extendStep,
        reRangeThenLegendClick: this.data.trendOpt.layerDataViewOptions.reRangeThenLegendClick,
        reRangeThenDataChange: this.data.trendOpt.layerDataViewOptions.reRangeThenDataChange,
        durationAnimation: this.data.trendOpt.layerDataViewOptions.durationAnimation,
        animation: this.data.trendOpt.layerDataViewOptions.animation,
        lineColor: this.data.trendOpt.layerDataViewOptions.lineColor,
        areaColor: this.data.trendOpt.layerDataViewOptions.lineColor,
        areaGradientColors: [this.data.trendOpt.layerDataViewOptions.lineColor],
        separateLayer: this.data.trendOpt.layerDataViewOptions.separateLayer,
      });
    }
    if (this.data?.reqOpt) {
      this.reqOpt = this.formBuilder.group({
        date: { start: this.data?.reqOpt.date?.start, end: this.data?.reqOpt.date?.end },
        pointsCount: this.data?.reqOpt.pointsCount,
        exponent: this.data?.reqOpt.exponent,
      });

      if (this.data.reqOpt.sourceType === 'tag') {
        this.pointsCount = this.data.reqOpt.pointsCount;
      }
      this.date = { dateFrom: this.data.reqOpt.date?.start, dateTo: this.data.reqOpt.date?.end };
      this.chartData = this.data.reqOpt.data?.length ? Array.from(this.data.reqOpt.data).reverse() : [];
    }
    if (this.data?.isGroup) {
      this.isGroup = true;
    }
    if (this.data?.maxSelectedCount !== undefined && this.data?.maxSelectedCount !== null) {
      this.maxSelectedCount.patchValue(this.data.maxSelectedCount);
    }
  }

  public onSave(): void {
    if (this.data?.reqOpt) {
      this.setValues();
    }

    const res: Record<string, unknown> = {};

    if (this.data?.chartOpt) {
      res.chartOpt = this.chartForm?.getRawValue();
    }
    if (this.data?.layerOpt) {
      res.layerOpt = this.layerFormSource?.getRawValue();
    }
    if (this.data?.trendOpt) {
      res.trendOpt = this.trendForm?.getRawValue();
    }
    if (this.data?.reqOpt) {
      const date =
        this.reqOpt?.value?.date?.start && this.reqOpt?.value?.date?.end
          ? { dateFrom: this.reqOpt?.value?.date?.start, dateTo: this.reqOpt?.value?.date?.end }
          : null;

      res.reqOpt = {
        sourceType: this.data.reqOpt.sourceType,
        name: this.data.reqOpt.name,
        data: this.data.reqOpt.data,
        date,
        pointsCount: this.pointsCount,
        exponent: this.reqOpt.get('exponent').value,
      };
    }

    if (this.maxSelectedCount.value !== this.data.maxSelectedCount) {
      res.maxSelectedCount = this.maxSelectedCount.value;
    }

    this.popupRef.close(res);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onReset(): void {
    const res: Record<string, unknown> = {};

    if (this.data?.reqOpt) {
      res.reqOpt = {
        sourceType: this.data.reqOpt.sourceType,
        name: this.data.reqOpt.name,
        data: this.data.reqOpt.data,
        date: this.date,
        pointsCount: this.pointsCount,
        exponent: this.reqOpt.get('exponent').value,
      };
    }

    res.reset = true;
    this.popupRef.close(res);
  }

  public onKeyboardClick(key: KeyboardEvent): void {
    if (key && key?.key === 'Enter') {
      this.onCalendarClose();
    }
  }

  public onCalendarClose(): void {
    this.reqOpt.get('pointsCount').patchValue(0, { emitEvent: false });
  }

  public onClickExponent(type: 'plus' | 'minus'): void {
    const value = this.reqOpt.get('exponent')?.value ?? 1;
    if (type === 'plus') {
      this.reqOpt.get('exponent').patchValue(value * 10);
    } else {
      this.reqOpt.get('exponent').patchValue(value / 10);
    }
    this.cdr.markForCheck();
  }

  public onDownload(): void {
    const obj: IVCLineSaveData = {
      name: this.data.reqOpt.name,
      dateFrom: this.date.dateFrom,
      dateTo: this.date.dateTo,
      pointsCount: this.pointsCount,
      data: this.chartData,
    };
    try {
      const file = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
      saveAs(file, `${obj.name}:${obj.dateFrom.toLocaleDateString()}-${obj.dateTo.toLocaleDateString()}.json`);
    } catch (e) {
      this.mnemoLoggerService.catchErrorMessage('error', 'message.shared.error', e);
    }
  }

  public onCopy(): void {
    navigator.clipboard.writeText(this.chartData.toString());
    this.mnemoLoggerService.catchMessage('info', 'mnemo.ChartSettingComponent.copiedToBuffer');
  }

  private setValues(): void {
    this.date = {
      dateFrom: this.reqOpt.get('date').value?.start ?? this.data.reqOpt?.date?.start ?? null,
      dateTo: this.reqOpt.get('date').value?.end ?? this.data.reqOpt?.date?.end ?? null,
    };

    this.pointsCount = this.reqOpt.value?.pointsCount;
    if (this.date.dateFrom && !this.reqOpt.value?.pointsCount) {
      this.pointsCount = 0;
    } else if (!this.date.dateFrom && !this.reqOpt.value?.pointsCount) {
      this.pointsCount = null;
    }
  }
}
