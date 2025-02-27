/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { IChartData, IMnemoCharDataForSave } from '../../../../../models';
import { PopupReference } from '../../../../../services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-user-points-2',
  templateUrl: './chart-user-points.component.html',
  styleUrls: ['./chart-user-points.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartUserPointsComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly popupRef = inject<PopupReference<MnemoChartUserPointsComponent>>(PopupReference);

  // todo
  public form: FormGroup = this.formBuilder.group({
    textarea: '',
    name: '',
  });
  private newTrend: IMnemoCharDataForSave | null = null;

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onSave(): void {
    if (this.form.get('textarea')?.value.length < 2) {
      this.popupRef.close(null);
      return;
    }
    const userTrend: IChartData = {
      name: `user-${this.form.get('name')?.value}`,
      data: this.form.get('textarea')?.value,
    };
    this.popupRef.close(userTrend);
  }

  public onFileUpload(text: { xml: unknown; json: string }): void {
    try {
      this.newTrend = JSON.parse(text.json);
    } catch (e) {
      this.newTrend = null;
    }
    this.form.get('textarea').patchValue(this.newTrend?.data ?? '');
    this.form.get('name').patchValue(this.newTrend?.name ?? '');
  }
}
