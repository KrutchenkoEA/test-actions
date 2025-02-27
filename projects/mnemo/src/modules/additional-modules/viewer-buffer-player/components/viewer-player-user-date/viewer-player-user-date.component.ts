/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { LANGUAGE } from '@tl-platform/core';
import { TluiButtonModule, TluiDatepickerModule, TluiFormFieldModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { popup } from '../../../../../consts';
import { POPUP_DIALOG_DATA, PopupReference } from '../../../../../services';

@Component({
  selector: 'tl-mnemo-viewer-player-services-user-date',
  templateUrl: './viewer-player-user-date.component.html',
  styleUrls: ['./viewer-player-user-date.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
  standalone: true,
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    SvgIconComponent,
    TluiDatepickerModule,
    TluiFormFieldModule,
    AsyncPipe,
    TluiButtonModule,
    TranslocoPipe,
  ],
})
export class ViewerPlayerUserDateComponent implements OnInit {
  readonly data = inject<{
    dateFrom: Date;
    dateTo: Date;
  }>(POPUP_DIALOG_DATA);
  readonly language$ = inject<Observable<string>>(LANGUAGE);
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupRef = inject<PopupReference<ViewerPlayerUserDateComponent>>(PopupReference);

  public form: FormGroup;
  public date: { dateFrom: Date; dateTo: Date };

  public ngOnInit(): void {
    this.form = this.formBuilder.group({
      date: { start: this.data.dateFrom, end: this.data.dateTo },
    });
  }

  public onKeyboardClick(key): void {
    if (key && key?.key === 'Enter') {
      this.onCalendarClose();
    }
  }

  public onCalendarClose(): void {
    this.date = {
      dateFrom: this.form.value?.date?.start ? this.form.value?.date?.start : null,
      dateTo: this.form.value?.date?.end ? this.form.value?.date?.end : null,
    };
  }

  public onSave(): void {
    this.popupRef.close(this.date);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }
}
