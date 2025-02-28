/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tl-mnemo-active-shape-progress-bar',
  standalone: true,
  imports: [],
  templateUrl: './vertical-progress-bar.component.html',
  styleUrl: './vertical-progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeVerticalProgressBarComponent {}
