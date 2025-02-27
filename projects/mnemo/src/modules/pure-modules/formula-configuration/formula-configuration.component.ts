/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  DecorateUntilDestroy,
  LANGUAGE,
  STORE_GLOBAL,
  StoreService,
  takeUntilDestroyed,
  TluiDirectionModule,
} from '@tl-platform/core';
import { TluiButtonModule, TluiFormFieldModule, TluiNumberInputModule, TluiSelectModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { Observable } from 'rxjs';
import { IFormulaCalcRes, IFormulaData, IFormulaReference } from '../../../models';
import { MnemoLoggerService, POPUP_DIALOG_DATA, PopupReference, RtdbFormulaApiService } from '../../../services';

export const MNEMO_FORMULA_CACHE = 'mnemo-formula-cache';

@DecorateUntilDestroy()
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'formula-configuration',
  templateUrl: './formula-configuration.component.html',
  styleUrls: ['./formula-configuration.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    SvgIconComponent,
    TluiFormFieldModule,
    TluiDirectionModule,
    NgIf,
    TluiSelectModule,
    TluiNumberInputModule,
    AsyncPipe,
    TluiButtonModule,
    NgxSkeletonLoaderModule,
    TranslocoPipe,
    NgForOf,
  ],
})
export class FormulaConfigurationComponent implements OnInit {
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  public language$ = inject<Observable<string>>(LANGUAGE);
  readonly data = inject<IFormulaData>(POPUP_DIALOG_DATA);
  private readonly popupRef = inject<PopupReference<FormulaConfigurationComponent>>(PopupReference);
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  public unitList: IFormulaReference[] = [];
  public aggregationList: string[] = ['Agv', 'None', 'None'];

  public form: FormGroup = new FormGroup({
    formula: new FormControl(null),
    aggregation: new FormControl(null),
    formulaInterval: new FormControl(null),
    unitName: new FormControl(null),
    evaluateResult: new FormControl(null),
  });

  public isLoading: boolean = false;
  public isFormulaValid: boolean = false;
  public isResEmpty: boolean = false;
  public evaluateValue: number = null;

  public ngOnInit(): void {
    this.rtdbFormulaApiService
      .getReference()
      .pipe(takeUntilDestroyed(this))
      .subscribe((res) => {
        this.unitList = res;
        if (this.data.unitName) {
          this.setUnit();
        }
      });

    if (this.data?.formula?.length) {
      this.form.get('formula').patchValue(this.data?.formula);
    } else if (this.store.getCurrent<string>(MNEMO_FORMULA_CACHE)?.length) {
      this.form.get('formula').patchValue(this.store.getCurrent<string>(MNEMO_FORMULA_CACHE));
    }
    this.form.get('evaluateResult').patchValue(this.data.formulaValue);
    this.form.get('formulaInterval').patchValue(this.data.formulaInterval);
  }

  public close(): void {
    this.store.setState<string>(MNEMO_FORMULA_CACHE, this.form.get('formula').value);
    this.popupRef.close(null);
  }

  public save(): void {
    this.store.setState<string>(MNEMO_FORMULA_CACHE, this.form.get('formula').value);
    this.popupRef.close({
      formula: this.form.get('formula').value,
      formulaInterval: this.form.get('formulaInterval').value,
      formulaValue: this.evaluateValue,
      unitName: this.form.get('unitName')?.value?.shortName,
    });
  }

  public evaluate(): void {
    this.isLoading = true;
    this.rtdbFormulaApiService
      .getCalcByFormula<IFormulaCalcRes>(this.form.get('formula')?.value)
      .pipe(takeUntilDestroyed(this))
      .subscribe({
        next: (res) => {
          this.isResEmpty = !(res?.result as String)?.length;
          if (res.valid && !this.isResEmpty) {
            this.form.get('evaluateResult')?.patchValue(`${new Date().toLocaleString()} :: ${res.result}`);
          } else {
            this.form.get('evaluateResult')?.patchValue(``);
          }
          this.evaluateValue = res.result?.[0] as number;
          this.isLoading = false;
          this.isFormulaValid = res.valid;
          this.changeDetectorRef.markForCheck();
        },
        error: (e) => {
          this.isLoading = false;
          this.isFormulaValid = false;
          this.mnemoLoggerService.catchErrorMessage('error', e, null, false);
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  private setUnit(): void {
    const unit = this.unitList.find((u) => u.shortName === this.data.unitName);
    this.isLoading = true;
    this.changeDetectorRef.markForCheck();
    if (unit) {
      this.form.get('unitName').setValue(unit);
    }
    setTimeout(() => {
      this.isLoading = false;
      this.changeDetectorRef.markForCheck();
    });
  }
}
