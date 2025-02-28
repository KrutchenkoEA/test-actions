/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { TluiCheckboxModule } from '@tl-platform/ui';
import { MnemoScopeLoader } from '../../../../../../assets';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS, MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../../consts';
import {
  IMnemoChartRequestOptions,
  IMnemoChartViewOptions,
  IPieChartOptions,
  PieChartFormType,
} from '../../../../../../models';
import { MnemoFormCreateService } from '../../../../../../services';
import {
  MnemoPieSettingFormComponent,
  MnemoRequestSettingFormComponent,
  MnemoViewSettingFormComponent,
} from '../../../../../pure-modules';
import { ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE, ACTIVE_SHAPES_PIE_CHART_OPTIONS } from '../../../consts';
import { ActiveShapesOptionsBaseDirective } from '../../mnemo-options-base.directive';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-pie-chart-options',
  templateUrl: './pie-chart-options.component.html',
  styleUrls: ['./pie-chart-options.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MnemoRequestSettingFormComponent,
    MnemoPieSettingFormComponent,
    TluiCheckboxModule,
    TranslocoPipe,
    MnemoViewSettingFormComponent,
  ],
  providers: [
    MnemoFormCreateService,
    provideTranslocoScope({
      scope: 'mnemo',
      loader: MnemoScopeLoader,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapePieChartOptionsComponent
  extends ActiveShapesOptionsBaseDirective<PieChartFormType>
  implements OnInit
{
  public store: StoreService = inject<StoreService>(STORE_GLOBAL);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  private readonly formBuilder = inject(FormBuilder);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.formBuilder.group({
      requestControl: new FormControl<boolean>(false),
      requestForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartRequestOptions>(
        {},
        MNEMO_CHART_DEFAULT_REQUEST_OPTIONS
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartViewOptions>(
        {},
        MNEMO_CHART_DEFAULT_VIEW_OPTIONS
      ),
      optionsForm: this.mnemoFormCreateService.createFormWithType<IPieChartOptions>(
        {},
        ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE
      ),
    });

    super.ngOnInit();

    const options = this.store.getCurrent<IPieChartOptions>(ACTIVE_SHAPES_PIE_CHART_OPTIONS);
    this.setOptions(options);

    this.optionsForm.patchValue(options, { emitEvent: false });

    this.optionsForm.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value: IPieChartOptions) => {
      this.setOptions(value);
    });

    if (this.optionsForm.controls.fitToWidget) {
      this.optionsForm.controls.outerRadius.disable();
    }
  }

  private setOptions(values: IPieChartOptions | null = null): void {
    const options = {};
    Object.entries(ACTIVE_SHAPES_PIE_CHART_DEFAULT_VALUE)?.forEach(([key, value]) => {
      options[key] = values ? values[key] : value;
    });

    this.store.setState<IPieChartOptions>(ACTIVE_SHAPES_PIE_CHART_OPTIONS, options as IPieChartOptions);
  }
}
