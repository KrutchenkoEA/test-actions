/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { of, switchMap } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IPostTag, IUTTableCellData } from '../../../../../../models';
import { MnemoLoggerService, PopupService, RtdbTagApiService } from '../../../../../../services';
import { ViewerTagService } from '../../../../../pure-modules';
import { ManualTagModalComponent } from '../../../../../pure-modules';
import { UtvService } from '../utv.service';

@Injectable()
export class UtvManualTagValueService {
  private readonly popupService = inject(PopupService);
  private readonly utvService = inject(UtvService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public openManualTag(cell: IUTTableCellData): void {
    this.popupService
      .open(ManualTagModalComponent, { param: { tagName: cell.custom.tagName, val: cell.v } })
      .popupRef.afterClosed()
      .pipe(
        takeUntil(this.utvService.univerTableDestroy$),
        switchMap((res: { date: Date; value: number; comment: string; status: number }) => {
          if (res?.value) {
            return this.rtdbTagApiService.postManualTagData([
              {
                id: this.viewerTagService.tagNameIdMap.get(cell.custom.tagName),
                guid: this.viewerTagService.tagNameGuidMap.get(cell.custom.tagName),
                status: res.status,
                time: res.date,
                val: res.value.toString(),
                comment: res.comment,
              } as IPostTag,
            ]);
          }
          return of([]);
        })
      )
      .subscribe({
        next: () => this.mnemoLoggerService.catchMessage('ok', 'mnemo.ManualTagModalComponent.success'),
        error: (e) => this.mnemoLoggerService.catchErrorMessage('error', 'mnemo.ManualTagModalComponent.error: ', e),
      });
  }
}
