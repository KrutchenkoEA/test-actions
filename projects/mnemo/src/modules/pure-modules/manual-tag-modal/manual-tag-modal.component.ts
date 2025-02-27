/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { TluiDirectionModule } from '@tl-platform/core';
import {
  TluiButtonModule,
  TluiDatepickerModule,
  TluiFormFieldModule,
  TluiNumberInputModule,
  TluiSelectModule,
} from '@tl-platform/ui';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { popup } from '../../../consts';
import { ITableParams, TagStatusEnum } from '../../../models';
import { POPUP_DIALOG_DATA, PopupReference } from '../../../services';

@Component({
  selector: 'tl-mnemo-lib-manual-tag-modal',
  standalone: true,
  imports: [
    TluiNumberInputModule,
    TluiDirectionModule,
    TluiFormFieldModule,
    ReactiveFormsModule,
    TranslocoPipe,
    TluiButtonModule,
    TluiDatepickerModule,
    FormsModule,
    TranslocoDirective,
    AngularSvgIconModule,
    NgForOf,
    TluiSelectModule,
  ],
  templateUrl: './manual-tag-modal.component.html',
  styleUrl: './manual-tag-modal.component.scss',
  animations: [popup],
})
export class ManualTagModalComponent implements OnInit {
  private readonly popupRef = inject<PopupReference<ManualTagModalComponent>>(PopupReference);
  readonly data = inject<{ param: ITableParams }>(POPUP_DIALOG_DATA);
  private readonly cdr = inject(ChangeDetectorRef);

  public valueControl: FormControl<number | null> = new FormControl<number | null>(null);
  public dateControl: FormControl<Date | null> = new FormControl<Date | null>(null);
  public commentControl: FormControl<string> = new FormControl<string>('');
  public statusControl: FormControl<string> = new FormControl<string>('Good');

  public ngOnInit(): void {
    this.dateControl.patchValue(new Date());
    if (this.data?.param?.val && typeof this.data?.param?.val === 'number') {
      this.valueControl.patchValue(this.data.param.val);
    }
  }

  public onSave(): void {
    let status = 192;
    switch (this.statusControl.value) {
      case TagStatusEnum.Bad:
        status = 0;
        break;
      case TagStatusEnum.Uncertan:
        status = 64;
        break;
      case TagStatusEnum.Good:
      default:
        status = 192;
        break;
    }

    this.popupRef.close({
      date: this.dateControl?.value ?? new Date(),
      value: this.valueControl?.value,
      comment: this.commentControl?.value,
      status,
    });
  }

  public onClose(): void {
    this.popupRef.close(null);
  }
}
