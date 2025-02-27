/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { combineLatestWith } from 'rxjs';
import { MnemoLoggerService, RtdbFormulaApiService, RtdbTagApiService } from '../../../../services';
import { ViewerTagService } from './viewer-tag.service';
import { ViewerService } from './viewer.service';

@DecorateUntilDestroy()
@Injectable()
export class ViewerCheckerService {
  public viewerService = inject(ViewerService);
  public viewerTagService = inject(ViewerTagService);
  public rtdbTagApiService = inject(RtdbTagApiService);
  public rtdbFormulaApiService = inject(RtdbFormulaApiService);
  public mnemoLoggerService = inject(MnemoLoggerService);

  public init(): void {
    this.viewerService.showVersion();
    this.rtdbFormulaApiService.checkMethodType();

    this.viewerService.isViewerInit$
      .pipe(combineLatestWith(this.viewerService.isViewerInitActiveShapes$), takeUntilDestroyed(this))
      .subscribe((v) => {
        if (v[0] || v[1]) {
          this.checkMethodTypeRdb();
          this.getTagsMetaInfo();
        }
      });
  }

  public checkReady(): void {
    switch (this.viewerService.selectedNodeType$.value) {
      case 'mnemoscheme':
        this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.mnemoschemeReady');
        break;
      case 'table':
        this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.tableReady');
        break;
      case 'dashboard':
        this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.dashboardReady');
        break;
      default:
        break;
    }
  }

  public checkMethodTypeRdb(): void {
    this.rtdbTagApiService.checkMethodType(
      [...this.viewerTagService.tagsNamesOnly$.value, ...this.viewerTagService.tagsNamesOnlyActiveShapes$.value],
      this.viewerTagService.tagNameIdMap,
      this.viewerTagService.tagNameGuidMap
    );
  }

  public getTagsMetaInfo(): void {
    this.rtdbTagApiService
      .getTagMetaByArray([
        ...this.viewerTagService.tagsNamesOnly$.value,
        ...this.viewerTagService.tagsNamesOnlyActiveShapes$.value,
      ])
      .pipe(takeUntilDestroyed(this))
      .subscribe((m) => {
        m.forEach((i) => {
          this.viewerTagService.tagMetaInfoMap.set(i.name, {
            guid: i.guid,
            name: i.name,
            unitName: i.unitName,
          });
        });
        this.viewerTagService.updateTagsMetaInfo$.next(null);
      });
  }
}
