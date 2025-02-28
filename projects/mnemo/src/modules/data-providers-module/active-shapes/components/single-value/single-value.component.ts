/* eslint-disable import/no-extraneous-dependencies */
import { NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { ACTIVE_SHAPES_ITEM_ID, ACTIVE_SHAPES_ITEM_OPTIONS } from '../../active-shapes.tokens';

@Component({
  standalone: true,
  selector: 'tl-mnemo-active-shape-single-value',
  templateUrl: './single-value.component.html',
  styleUrls: ['./single-value.component.scss'],
  imports: [NgForOf, NgIf],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeSingleValueComponent {
  public options = inject(ACTIVE_SHAPES_ITEM_OPTIONS);
  public id = inject(ACTIVE_SHAPES_ITEM_ID);

  public data: number = 0;

  // eslint-disable-next-line @angular-eslint/no-input-rename, @typescript-eslint/no-empty-function
  @Input('data')
  public set inputData(v: unknown) {}
}
