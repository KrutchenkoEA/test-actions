/* eslint-disable import/no-extraneous-dependencies */
import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@tl-platform/core';
import { ViewerRefreshService, ViewerService, ViewerTagService } from '../services';
import { ViewerCheckerService } from '../services/viewer-checker.service';

@Directive({
  selector: '[viewerCoreRestDirective]',
  standalone: true,
})
export class ViewerCoreRestDirective implements OnInit, OnDestroy {
  public viewerService = inject(ViewerService);
  public viewerTagService = inject(ViewerTagService);
  public viewerRefreshService = inject(ViewerRefreshService);
  public viewerCheckerService = inject(ViewerCheckerService);

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit(): void {
    this.viewerCheckerService.init();

    this.viewerRefreshService.isUpdateData$.pipe(takeUntilDestroyed(this)).subscribe((v) => {
      if (!this.viewerTagService.isTagsStart$.value && v) {
        this.viewerTagService.isTagsStart$.next(true);
        this.viewerCheckerService.checkReady();
      }
    });
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnDestroy(): void {
    this.viewerService.cleanData();
  }
}
