/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeDetectionStrategy, Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideTranslocoScope, TranslocoModule } from '@jsverse/transloco';
import {
  DecorateUntilDestroy,
  SnackBarService,
  STORE_GLOBAL,
  StoreService,
  takeUntilDestroyed,
  ThemeConfiguratorService,
} from '@tl-platform/core';
import {
  IOptionsFormType,
  ITluiChartSingleLayerInputModel,
  TLUI_CHART_FORM_CREATE_SERVICE,
  TluiButtonModule,
  TluiChartFormCreateService,
  TluiCheckboxModule,
} from '@tl-platform/ui';
import { saveAs } from 'file-saver';
import { MnemoScopeLoader } from '../../../../../../assets';
import { MNEMO_CHART_DEFAULT_REQUEST_OPTIONS, MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../../consts';
import { IMnemoChartRequestOptions, IMnemoChartViewOptions } from '../../../../../../models';
import { MnemoFormCreateService } from '../../../../../../services';
import {
  FileUploadService,
  MnemoChartSettingFormComponent,
  MnemoRequestSettingFormComponent,
  MnemoViewSettingFormComponent,
} from '../../../../../pure-modules';
import { ACTIVE_SHAPES_COMBO_CHART_IS_HORIZONTAL, ACTIVE_SHAPES_COMBO_CHART_OPTIONS } from '../../../consts';
import { ActiveShapesOptionsBaseDirective } from '../../mnemo-options-base.directive';

@DecorateUntilDestroy()
@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-combo-chart-options',
  templateUrl: './combo-chart-options.component.html',
  styleUrls: ['./combo-chart-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    TranslocoModule,
    TluiButtonModule,
    MnemoRequestSettingFormComponent,
    MnemoChartSettingFormComponent,
    TluiCheckboxModule,
    MnemoViewSettingFormComponent,
  ],
  providers: [
    TluiChartFormCreateService,
    MnemoFormCreateService,
    FileUploadService,
    SnackBarService,
    provideTranslocoScope({
      scope: 'mnemo',
      loader: MnemoScopeLoader,
    }),
  ],
})
export class ActiveShapeComboChartOptionsComponent
  extends ActiveShapesOptionsBaseDirective<IOptionsFormType>
  implements OnInit {
  public store: StoreService = inject<StoreService>(STORE_GLOBAL);
  private readonly tluiChartFormCreateService = inject<TluiChartFormCreateService>(TLUI_CHART_FORM_CREATE_SERVICE);
  private readonly mnemoFormCreateService = inject(MnemoFormCreateService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly themeService = inject(ThemeConfiguratorService);
  private readonly fileUploadService = inject(FileUploadService);

  @ViewChild('fileInput') public fileInput: ElementRef<HTMLInputElement>;

  public isDarkTheme: boolean = true;

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
      optionsForm: this.tluiChartFormCreateService.createSettingFormDefault(),
    });

    super.ngOnInit();

    this.themeService.isDarkTheme.pipe(takeUntilDestroyed(this)).subscribe((value) => {
      this.isDarkTheme = value;
    });

    const options = this.store.getCurrent<ITluiChartSingleLayerInputModel>(ACTIVE_SHAPES_COMBO_CHART_OPTIONS);
    if (options) {
      this.tluiChartFormCreateService.patchSettingForm(options);
    } else {
      this.store.setState<ITluiChartSingleLayerInputModel>(
        ACTIVE_SHAPES_COMBO_CHART_OPTIONS,
        this.tluiChartFormCreateService.createDefaultData(),
      );
    }

    this.optionsForm.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value: ITluiChartSingleLayerInputModel) => {
      this.store.setState<ITluiChartSingleLayerInputModel>(
        ACTIVE_SHAPES_COMBO_CHART_OPTIONS,
        this.tluiChartFormCreateService.compareAndDeleteKey(value, this.isDarkTheme),
      );
    });

    this.store
      .getState$<boolean>(ACTIVE_SHAPES_COMBO_CHART_IS_HORIZONTAL)
      .pipe(takeUntilDestroyed(this))
      .subscribe((v) => {
        if (v) {
          this.optionsForm.patchValue({
            tooltip: { chartOrientation: 'horizontal', tooltipMarkerType: 'horizontal-line' },
            axisX: { primary: false },
            axisY: { primary: true },
          });
        } else {
          this.optionsForm.patchValue({
            tooltip: { chartOrientation: 'vertical', tooltipMarkerType: 'line' },
            axisX: { primary: true },
            axisY: { primary: false },
          });
        }
      });

    this.fileUploadService.fileUpload.pipe(takeUntilDestroyed(this)).subscribe((d) => {
      const formValue = JSON.parse(d.json);
      if (formValue) {
        this.tluiChartFormCreateService.patchSettingForm(formValue);
      }
    });
  }

  public refresh(): void {
    this.tluiChartFormCreateService.patchSettingForm(this.tluiChartFormCreateService.createDefaultData());
  }

  public downloadStyle(): void {
    const formValue = this.optionsForm.getRawValue();
    if (!formValue) return;
    const filename = `dashboard-settings-${new Date().toLocaleString()}.json`;
    const file: File = new File([JSON.stringify(formValue)], filename, { type: 'application/json' });
    saveAs(file, filename);
  }

  public onFileChange(event): void {
    const file = event.target.files[0];
    if (file) {
      this.fileUploadService.file = file;
      this.fileUploadService.checkAndRead();
      setTimeout(() => {
        this.fileInput.nativeElement.value = '';
      });
    }
  }
}
