/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { skip, Subject, Subscription, throttleTime } from 'rxjs';
import { filter } from 'rxjs/operators';
import { PlayerModeService } from '../player-services';
import { ViewerFormulaService } from './viewer-formula.service';
import { ViewerOMService } from './viewer-om.service';
import { ViewerRefreshService } from './viewer-refresh.service';
import { ViewerTagService } from './viewer-tag.service';
import { ViewerService } from './viewer.service';
import { IMnemoUnsubscribed } from '../../../../models';

@Injectable()
export class ViewerIntervalService implements IMnemoUnsubscribed {
  public viewerService = inject(ViewerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly viewerRefreshService = inject(ViewerRefreshService);
  private readonly playerModeService = inject(PlayerModeService);

  public subscriptions: Subscription[] = [];

  public customRefreshTime: number = 30000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public customInterval: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public wsInterval: any = null;

  public intervalTicks$: Subject<null> = new Subject<null>();

  public initSubs(): void {
    if (
      this.viewerService.mnemoViewerType === 'ws' &&
      (this.viewerTagService.isTagsInit$.value || this.viewerTagService.isTagsInitActiveShapes$.value)
    ) {
      this.viewerService.mnemoUpdateType = 'ws';
    } else if (
      this.viewerService.mnemoViewerType === 'rest' ||
      this.viewerTagService.isTagsInit$.value ||
      this.viewerTagService.isTagsInitActiveShapes$.value ||
      this.viewerOMService.omAttrInit$.value ||
      this.viewerOMService.omAttrInitActiveShapes$.value ||
      this.viewerFormulaService.formulaInit$.value ||
      this.viewerFormulaService.formulaInitActiveShapes$.value
    ) {
      this.viewerService.mnemoUpdateType = 'rest';
    } else {
      this.viewerService.mnemoUpdateType = 'custom';
    }

    this.viewerRefreshService.startUpdate();

    if (this.viewerService.disableEvents) {
      this.viewerService.sizeEvents = 0;
    } else {
      this.viewerService.sizeEvents = 5;
    }

    if (
      this.viewerTagService.isTagsInit$.value ||
      this.viewerOMService.omAttrInit$.value ||
      this.viewerFormulaService.formulaInit$.value
    ) {
      this.viewerService.isViewerInit$.next(true);
    }

    if (
      this.viewerTagService.isTagsInitActiveShapes$.value ||
      this.viewerOMService.omAttrInitActiveShapes$.value ||
      this.viewerFormulaService.formulaInitActiveShapes$.value
    ) {
      this.viewerService.isViewerInitActiveShapes$.next(true);
    }

    const refreshSub$ = this.viewerRefreshService.isUpdateData$.subscribe((v) => {
      if (v) {
        this.getSubscribe();
      } else {
        this.clear();
      }
    });

    const playerModeSub$ = this.playerModeService.isPlayerMode$.pipe(skip(1)).subscribe((v) => {
      if (v) {
        this.viewerRefreshService.stopUpdate();
      } else {
        this.viewerRefreshService.startUpdate();
      }
    });

    this.subscriptions.push(refreshSub$);
    this.subscriptions.push(playerModeSub$);
  }

  public destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private getSubscribe(): void {
    clearInterval(this.customInterval);
    if (this.viewerService.mnemoUpdateType === 'ws') {
      this.wsInterval = this.viewerTagService.updateTagData$
        .pipe(
          filter((d) => !!d),
          throttleTime(5000),
        )
        .subscribe(() => this.nextTrigger());
    } else {
      setTimeout(() => this.nextTrigger());
      this.customInterval = setInterval(() => this.nextTrigger(), this.customRefreshTime);
    }
  }

  private unSubscribe(): void {
    if (this.viewerService.mnemoUpdateType === 'ws') {
      (this.wsInterval as Subscription)?.unsubscribe();
    } else {
      clearInterval(this.customInterval);
    }
  }

  private clear(): void {
    this.unSubscribe();
    this.wsInterval = null;
    this.customInterval = null;
  }

  private nextTrigger(): void {
    this.intervalTicks$.next(null);
  }
}
