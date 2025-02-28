/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActiveShapesAbstractClass, IMnemoUnsubscribed } from '../../../../../models';
import { ViewerFormulaService, ViewerService } from '../../../../pure-modules';

@Injectable()
export class ActiveShapesFormulaService implements ActiveShapesAbstractClass<null, null>, OnDestroy {
  public viewerService = inject(ViewerService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);

  public subscriptions: Subscription[] = [];
  public updateEnabled: boolean = true;

  public ngOnDestroy(): void {
    this.viewerFormulaService.cleanData();
    this.destroySubs();
  }

  public initSubs(): void {
  }

  public destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public getHistoryData(): void {
  }

  public sortHistoryData(): void {
  }
}
