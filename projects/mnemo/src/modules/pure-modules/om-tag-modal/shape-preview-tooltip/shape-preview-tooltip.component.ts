/* eslint-disable import/no-extraneous-dependencies */
import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'tl-mnemo-shape-preview-tooltip',
  templateUrl: './shape-preview-tooltip.component.html',
  styleUrls: ['./shape-preview-tooltip.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tooltip', [
      transition(':enter', [style({ opacity: 0 }), animate(300, style({ opacity: 1 }))]),
      transition(':leave', [animate(300, style({ opacity: 0 }))]),
    ]),
  ],
})
export class ShapePreviewTooltipComponent {
  @Input()
  public shapeTitle = '';

  @Input()
  public shapeSrc = '';
}
