/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import {
  DATES_GLOBAL$,
  DecorateUntilDestroy,
  IDatesInterval,
  STORE_GLOBAL,
  StoreObservable,
  StoreService,
  takeUntilDestroyed,
  TluiDirectionModule,
} from '@tl-platform/core';
import { TluiAccordionModule, TluiButtonModule, TluiFormFieldModule, TluiSelectModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import {
  IDashboardItem,
  IRawQuerySourceDataPlaceholder,
  ISourceModalResult,
  RawQuerySourceDataParamsType,
} from '../../../../models';
import { PopupService } from '../../../../services';
import { OmTagModalComponent, OmTagModalModule, ViewerService } from '../../../pure-modules';
import { VIEWER_DASHBOARD_SELECTED_ITEM, VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED } from '../../active-shapes';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-dashboard-settings',
  templateUrl: './viewer-dashboard-settings.component.html',
  styleUrls: ['./viewer-dashboard-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TluiAccordionModule,
    TranslocoDirective,
    NgIf,
    TluiFormFieldModule,
    NgForOf,
    MatTooltip,
    SvgIconComponent,
    TluiDirectionModule,
    TluiSelectModule,
    TranslocoPipe,
    TluiButtonModule,
    OmTagModalModule,
  ],
})
export class ViewerDashboardSettingsComponent implements OnInit {
  private readonly store = inject<StoreService>(STORE_GLOBAL);
  private readonly dates$ = inject<StoreObservable<IDatesInterval>>(DATES_GLOBAL$);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupService = inject(PopupService);
  private readonly viewerService = inject(ViewerService);
  private readonly cdr = inject(ChangeDetectorRef);

  public baseUrl: string = this.viewerService.baseUrl;
  public data: IDashboardItem | null = null;

  public currentPlaceholderActive: number = undefined;
  public currentTagActive: number = undefined;

  public form: FormGroup = this.formBuilder.group({
    placeholders: new FormArray([]),
    tags: new FormArray([]),
  });

  public isTreeEnable: boolean = false;
  public selectedParameter: { pathArray: string[]; placeholder: string } | null = null;

  public get placeholders(): FormArray {
    return this.form.controls.placeholders as FormArray;
  }

  public get tags(): FormArray {
    return this.form.controls.tags as FormArray;
  }

  public ngOnInit(): void {
    this.store
      .getState$<IDashboardItem>(VIEWER_DASHBOARD_SELECTED_ITEM)
      .pipe(takeUntilDestroyed(this))
      .subscribe((d) => {
        if (d) {
          this.data = d;
          if (!this.data.options.defaultData) {
            this.data.options.defaultData = Object.assign([], d.options.data);
          }
          this.getPlaceholdersAndTags();
        } else {
          this.data = null;
        }
      });
  }

  public findTag(index: number, type: 'tag' | 'raw'): void {
    this.popupService
      .open(OmTagModalComponent, {
        baseUrl: this.baseUrl,
        multipleSelect: true,
        multipleSelectObject: true,
        allowMethods: ['objectModel'],
      })
      .popupRef.afterClosed()
      .subscribe((result: ISourceModalResult) => {
        const arr: string[] = [];
        if (result?.tagsFromObjects?.length && type === 'raw') {
          result.tagsFromObjects?.forEach((t) => {
            if (t?.inputData?.length) {
              arr.push(t.inputData);
            }
          });
          this.placeholders.controls[index].get('value').patchValue(arr.join(','));
          this.form.controls.placeholders.markAsDirty();
          this.form.controls.placeholders.markAsTouched();
          this.cdr.markForCheck();
        }

        if (result?.tags?.length && type === 'tag') {
          result.tags?.forEach((t) => {
            if (t.tagName) {
              arr.push(t.tagName);
            }
          });
          this.tags.controls[index].get('value').patchValue(arr.join(','));
          this.form.controls.tags.markAsDirty();
          this.form.controls.tags.markAsTouched();
          this.cdr.markForCheck();
        }
      });
  }

  public isTouchedAndDirty(): boolean {
    return (
      (this.form.controls.placeholders.touched && this.form.controls.placeholders.dirty) ||
      (this.form.controls.tags.touched && this.form.controls.tags.dirty)
    );
  }

  public apply(): void {
    if (!this.isTouchedAndDirty()) return;
    this.data.options.data.forEach((opt) => {
      if (opt.sourceType === 'raw') {
        opt.sourceData.placeholders = this.placeholders.value;
      }
      if (opt.sourceType === 'tag') {
        // TODO
      }
    });

    this.store.setState<IDashboardItem>(VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED, this.data);
    setTimeout(() => this.store.setState<IDashboardItem>(VIEWER_DASHBOARD_SELECTED_ITEM_CHANGED, null));
    this.store.setState<null>(VIEWER_DASHBOARD_SELECTED_ITEM, null);
  }

  public reset(): void {
    this.data.options.data = Object.assign([], this.data.options.defaultData);
    this.getPlaceholdersAndTags();
    if (this.isTreeEnable) {
      this.isTreeEnable = false;
      setTimeout(() => {
        this.isTreeEnable = true;
        this.cdr.markForCheck();
      }, 300);
    }
  }

  public close(): void {
    this.reset();
    this.store.setState<null>(VIEWER_DASHBOARD_SELECTED_ITEM, null);
  }

  public attributeSelected(result: ISourceModalResult): void {
    const tags = [];
    result?.tagsFromObjects?.forEach((t) => {
      if (t?.inputData?.length) {
        tags.push(t?.inputData);
      }
    });
    const param = this.placeholders?.controls?.find((c) => c.value.placeholder === this.selectedParameter?.placeholder);
    if (param?.get('isTreeEnable')?.value) {
      param.get('value').patchValue(tags.join(','));
      param.get('selectedPathArray').patchValue(result.objectsPathArr);
      if (result?.tagsFromObjects?.length) {
        this.form.controls.placeholders.markAsDirty();
        this.form.controls.placeholders.markAsTouched();
      }
    }
  }

  public selectPathArray(group: AbstractControl): void {
    if (group.value?.selectedPathArray) {
      this.selectedParameter = {
        pathArray: group.value?.selectedPathArray,
        placeholder: group.value?.placeholder,
      };
    }
  }

  private getPlaceholdersAndTags(): void {
    this.form.controls.placeholders = new FormArray([]);
    this.form.controls.tags = new FormArray([]);
    const date = this.getHeaderData();

    this.data.options.data?.forEach((d, i) => {
      if (d.sourceType === 'raw') {
        (d.sourceData.placeholders as IRawQuerySourceDataPlaceholder[]).forEach((p) => {
          let selectorData = null;
          let { value } = p;

          if (p.placeholder === 'startTime') {
            value = date.fromDateTime;
          }
          if (p.placeholder === 'endTime') {
            value = date.toDateTime;
          }
          if (p?.selectArr) {
            selectorData = Array.isArray(p.selectArr) ? p.selectArr : p.selectArr.split(',');
          }
          if (p.isTreeEnable) {
            this.isTreeEnable = true;
          }
          if (p?.selectedPathArray?.length && !this.selectedParameter) {
            this.selectedParameter = {
              pathArray: p?.selectedPathArray,
              placeholder: p.placeholder,
            };
          }

          this.pushPlaceholderIntoForm(
            i,
            p.placeholder,
            value,
            p.required,
            p.disabled,
            p.type,
            selectorData,
            p.isTreeEnable,
            p.selectedPathArray
          );
        });
      } else if (d.sourceType === 'tag') {
        this.pushTagsIntoForm(d.sourceData.tagName, d.sourceData.tagId, i);
      }
    });
  }

  private pushPlaceholderIntoForm(
    sourceId: number,
    placeholder: string,
    value: string = '',
    required: boolean = true,
    disabled: boolean = false,
    type: RawQuerySourceDataParamsType = 'string',
    selectArr: unknown[] = null,
    isTreeEnable: boolean = false,
    selectedPathArray: string[] | null = null
  ): void {
    const data = new FormGroup({
      placeholder: new FormControl(placeholder, [Validators.required]),
      value: new FormControl(value, [Validators.required]),
      disabled: new FormControl(disabled),
      required: new FormControl(required),
      type: new FormControl(type),
      selectArr: new FormControl(selectArr),
      isTreeEnable: new FormControl(isTreeEnable),
      selectedPathArray: new FormControl(selectedPathArray),
      sourceId: new FormControl(sourceId),
    });

    this.placeholders.push(data);
  }

  private pushTagsIntoForm(tagName, tagId, sourceId: number): void {
    const data = new FormGroup({
      tagName: new FormControl(tagName, [Validators.required]),
      tagId: new FormControl(tagId, [Validators.required]),
      sourceId: new FormControl(sourceId),
    });

    this.tags.push(data);
  }

  private getHeaderData(): {
    fromDateTime: string;
    toDateTime: string;
  } {
    let date: IDatesInterval = this.dates$.getValue();

    if (!date?.fromDateTime || !date?.toDateTime) {
      date = {
        fromDateTime: new Date(new Date().setHours(0, 0, 0)),
        toDateTime: new Date(new Date().setHours(23, 59, 59)),
      };
    }

    const fromDateDate = new Date(date.fromDateTime).toLocaleDateString('ru-RU').split('.').reverse().join('-');
    const fromDateTime = new Date(date.fromDateTime).toLocaleTimeString('ru-RU');
    const fromDate = `${fromDateDate} ${fromDateTime}`;

    const toDateDate = new Date(date.toDateTime).toLocaleDateString('ru-RU').split('.').reverse().join('-');
    const toDateTime = new Date(date.toDateTime).toLocaleTimeString('ru-RU');
    const toDate = `${toDateDate} ${toDateTime}`;

    return {
      fromDateTime: fromDate,
      toDateTime: toDate,
    };
  }
}
