/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective, TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { TluiButtonModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { Observable } from 'rxjs';
import { ToolbarButtonType, TreeOptType } from '../../../models';
import { MnemoLoggerService } from '../../../services';
import { PlayerModeService, ViewerCoreModule, ViewerRefreshService, ViewerService } from '../../pure-modules';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-viewer-toolbar',
  templateUrl: './viewer-toolbar.component.html',
  styleUrls: ['./viewer-toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    TranslocoDirective,
    NgIf,
    TluiButtonModule,
    MatTooltip,
    SvgIconComponent,
    AsyncPipe,
    TranslocoPipe,
    NgClass,
    ViewerCoreModule,
  ],
})
export class ViewerToolbarComponent implements OnInit {
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly viewerService = inject(ViewerService);
  public playerModeService = inject(PlayerModeService);
  public viewerRefreshService = inject(ViewerRefreshService);

  public isSelectedNodeType$: Observable<TreeOptType>;

  @Input() public buttonDirection: 'vert' | 'hor' = 'hor';

  public ngOnInit(): void {
    this.isSelectedNodeType$ = this.viewerService.selectedNodeType$;
  }

  public onClickButton(type: ToolbarButtonType): void {
    switch (type) {
      case 'refresh':
        this.viewerRefreshService.startUpdate();
        this.mnemoLoggerService.catchMessage('message', 'mnemo.ViewerToolbarComponent.dataUpdateStarted');
        if (this.playerModeService.isPlayerMode) {
          this.playerModeService.playerModeOff();
        }
        return;
      case 'stopRefresh':
        this.mnemoLoggerService.catchMessage('message', 'mnemo.ViewerToolbarComponent.dataRefreshStopped');
        this.viewerRefreshService.stopUpdate();
        if (this.playerModeService.isPlayerMode) {
          this.playerModeService.playerModeOff();
        }
        return;
      default:
        this.viewerService.toolbarButtonEmit$.next(type);
    }
  }
}
