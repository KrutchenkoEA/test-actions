/* eslint-disable import/no-extraneous-dependencies */
import { Directive, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { MnemoChartRequestFormType, MnemoChartViewFormType } from '../../../models';

@DecorateUntilDestroy()
@Directive({
  selector: '[tlMnemoFormOptionsBase]',
  standalone: true,
})
export class MnemoOptionsFormBaseDirective<U> implements OnInit {
  // @ts-ignore
  public formGroup: FormGroup<{
    requestControl: FormControl<boolean>;
    requestForm: MnemoChartRequestFormType;
    viewForm: MnemoChartViewFormType;
    optionsForm: U;
  }>;

  public get requestControl(): FormControl<boolean> {
    return this.formGroup?.controls?.requestControl;
  }

  public get requestForm(): MnemoChartRequestFormType {
    return this.formGroup?.controls?.requestForm;
  }

  public get viewForm(): MnemoChartViewFormType {
    return this.formGroup?.controls?.viewForm;
  }

  public get optionsForm(): U {
    return this.formGroup?.controls?.optionsForm;
  }

  public ngOnInit(): void {
    if (this.requestForm.controls.realtimeRefresh.value) {
      this.requestForm.controls.date.disable({ emitEvent: false });
    }

    if (this.requestForm.controls.date.value?.start && this.requestForm.controls.date.value?.end) {
      this.requestForm.controls.realtimeRefresh.disable({ emitEvent: false });
      this.requestForm.controls.hoursPeriod.disable({ emitEvent: false });
    }

    if (!this.requestForm.controls.scale.value) {
      this.requestForm.controls.intervalsCount.disable({ emitEvent: false });
      this.requestForm.controls.intervalsCount.patchValue(null, { emitEvent: false });
    }

    this.requestControl?.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (v) {
        this.requestForm.enable({ emitEvent: false });
        return;
      }
      this.requestForm.disable({ emitEvent: false });
    });

    this.requestForm.controls.realtimeRefresh.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value) => {
      if (value) {
        this.requestForm.patchValue({ date: null }, { emitEvent: false });
        this.requestForm.controls.date.disable();
        this.requestForm.controls.date.setErrors(null);
        this.requestForm.controls.realtimeRefresh.setErrors(null);
      } else {
        this.requestForm.controls.date.enable();
        this.requestForm.controls.date.setErrors({
          setDateOrRefresh: true,
        });
        this.requestForm.controls.realtimeRefresh.setErrors({
          setDateOrRefresh: true,
        });
      }
    });

    this.requestForm.controls.date.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((date) => {
      if (date?.start && date?.end) {
        this.requestForm.controls.realtimeRefresh.disable({ emitEvent: false });
        this.requestForm.controls.hoursPeriod.disable({ emitEvent: false });
        this.requestForm.controls.date.setErrors(null);
        this.requestForm.controls.realtimeRefresh.setErrors(null);
      } else {
        this.requestForm.controls.realtimeRefresh.enable({ emitEvent: false });
        this.requestForm.controls.hoursPeriod.enable({ emitEvent: false });
        this.requestForm.controls.date.setErrors({
          setDateOrRefresh: true,
        });
        this.requestForm.controls.realtimeRefresh.setErrors({
          setDateOrRefresh: true,
        });
      }
    });

    this.requestForm.controls.scale.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (v) {
        this.requestForm.controls.intervalsCount.enable();
        this.requestForm.controls.intervalsCount.patchValue(200);
      } else {
        this.requestForm.controls.intervalsCount.disable();
        this.requestForm.controls.intervalsCount.patchValue(null);
      }
    });

    this.viewForm.controls.autoZoom.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (v) {
        const object: Record<string, boolean> = {};
        new Array(this.viewForm.value.maxSelectedTrend)?.fill(1)?.forEach((value, index) => {
          object[`xy${index}`] = index === 0;
        });
        this.viewForm.patchValue({ autoZoomAxisActiveState: object });
      } else {
        this.viewForm.patchValue({ autoZoomAxisActiveState: null });
      }
    });

    this.viewForm.controls.maxSelectedTrend.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (v) {
        const existObject = this.viewForm.value.autoZoomAxisActiveState;
        const object: Record<string, boolean> = {};
        new Array(this.viewForm.value.maxSelectedTrend + 1)?.fill(1)?.forEach((value, index) => {
          const key = `xy${index}`;
          object[key] = existObject?.[key] ?? false;
        });
        this.viewForm.patchValue({ autoZoomAxisActiveState: object });
      } else {
        this.viewForm.patchValue({ autoZoomAxisActiveState: null });
      }
    });
  }
}
