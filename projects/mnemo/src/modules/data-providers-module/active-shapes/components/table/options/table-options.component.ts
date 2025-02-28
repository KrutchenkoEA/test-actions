/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy, STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { TluiCheckboxModule } from '@tl-platform/ui';
import { MnemoScopeLoader } from '../../../../../../assets';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS, MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../../consts';
import {
  IActiveShapeTableCommonOptions,
  IActiveShapeTableOptions,
  IActiveShapeTableRowOptions,
  IMnemoChartRequestOptions,
  IMnemoChartViewOptions,
  TableChartFormType,
  ToFormControlType,
} from '../../../../../../models';
import { MnemoFormCreateService } from '../../../../../../services';
import {
  MnemoRequestSettingFormComponent,
  MnemoViewSettingFormComponent,
  TableSettingFormComponent,
} from '../../../../../pure-modules';
import {
  ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE,
  ACTIVE_SHAPES_TABLE_OPTIONS,
} from '../../../consts';
import { ActiveShapesOptionsBaseDirective } from '../../mnemo-options-base.directive';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-table-options',
  templateUrl: './table-options.component.html',
  styleUrls: ['./table-options.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MnemoRequestSettingFormComponent,
    TableSettingFormComponent,
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
export class ActiveShapeTableOptionsComponent
  extends ActiveShapesOptionsBaseDirective<TableChartFormType>
  implements OnInit {
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
        MNEMO_CHART_DEFAULT_REQUEST_OPTIONS,
      ),
      viewForm: this.mnemoFormCreateService.createFormWithType<IMnemoChartViewOptions>(
        {},
        MNEMO_CHART_DEFAULT_VIEW_OPTIONS,
      ),
      optionsForm: this.formBuilder.group({
        table: this.mnemoFormCreateService.createFormWithType<IActiveShapeTableCommonOptions>(
          {},
          ACTIVE_SHAPES_TABLE_DEFAULT_VALUE,
        ),
        header: this.mnemoFormCreateService.createFormWithType<IActiveShapeTableRowOptions>(
          {},
          ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE,
        ),
        body: this.mnemoFormCreateService.createFormWithType<IActiveShapeTableRowOptions>(
          {},
          ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE,
        ),
        keyName: this.mnemoFormCreateService.createFormWithType<Record<string, string>>(
          {},
          ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE,
        ),
        keyNameCustom: this.formBuilder.group({}) as FormGroup<ToFormControlType<Record<string, string>>>,
        keyForm: new FormControl(null),
        nameForm: new FormControl(null),
      }),
    });

    super.ngOnInit();

    const options = this.store.getCurrent<IActiveShapeTableOptions>(ACTIVE_SHAPES_TABLE_OPTIONS);
    this.setOptions(options);
    this.optionsForm.patchValue(options, { emitEvent: false });

    this.optionsForm.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value: IActiveShapeTableOptions) => {
      this.setOptions(value);
    });

    if (!this.optionsForm.controls.header.value.isBorderVerticalEnabled) {
      this.optionsForm.controls.header.controls.borderVerticalWidth.disable();
    }

    if (!this.optionsForm.controls.header.value.isBorderHorizontalEnabled) {
      this.optionsForm.controls.header.controls.borderHorizontalWidth.disable();
    }

    if (!this.optionsForm.controls.body.value.isBorderVerticalEnabled) {
      this.optionsForm.controls.body.controls.borderVerticalWidth.disable();
    }

    if (!this.optionsForm.controls.body.value.isBorderHorizontalEnabled) {
      this.optionsForm.controls.body.controls.borderHorizontalWidth.disable();
    }
  }

  private setOptions(values: IActiveShapeTableOptions | null = null): void {
    const options = { table: {}, header: {}, body: {}, keyName: {}, keyNameCustom: {} };
    Object.entries(ACTIVE_SHAPES_TABLE_DEFAULT_VALUE)?.forEach(([key, value]) => {
      options.table[key] = values?.table ? values?.table[key] : value;
    });
    Object.entries(ACTIVE_SHAPES_TABLE_HEADER_DEFAULT_VALUE)?.forEach(([key, value]) => {
      options.header[key] = values?.header ? values?.header[key] : value;
    });
    Object.entries(ACTIVE_SHAPES_TABLE_BODY_DEFAULT_VALUE)?.forEach(([key, value]) => {
      options.body[key] = values?.body ? values?.body[key] : value;
    });
    Object.entries(ACTIVE_SHAPES_TABLE_KEY_NAME_DEFAULT_VALUE)?.forEach(([key, value]) => {
      options.keyName[key] = values?.keyName ? values?.keyName[key] : value;
    });
    if (values?.keyNameCustom) {
      Object.entries(values.keyNameCustom)?.forEach(([key, value]) => {
        options.keyNameCustom[key] = value;
      });
    }

    this.store.setState<IActiveShapeTableOptions>(ACTIVE_SHAPES_TABLE_OPTIONS, options as IActiveShapeTableOptions);
  }
}
