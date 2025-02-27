/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { catchError, combineLatestWith, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ITagHistoryData } from '../../../../models';
import { MnemoLoggerService, RtdbTagApiService } from '../../../../services';
import { PlayerService, ViewerService, ViewerTagService } from '../../../pure-modules';

@Injectable()
export class ViewerBufferTagService {
  private readonly viewerService = inject(ViewerService);
  private readonly playerService = inject(PlayerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public getData(): Observable<boolean> {
    if (!this.viewerTagService.tagsNames$.value) {
      return of(false);
    }

    const tagsNames = this.viewerTagService.tagsNames$.value?.filter((t) => !t?.roundValue);
    const tagsNamesRounded = this.viewerTagService.tagsNames$.value?.filter((t) => !!t?.roundValue);
    const tagsNamesActiveShapes = this.viewerTagService.tagsNamesOnlyActiveShapes$.value;

    const reqTags = tagsNames?.length
      ? this.rtdbTagApiService.getTagHistoryByArray(
          tagsNames.map((v) => v.name),
          null,
          '0',
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferFromIndex].toISOString(),
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferToIndex].toISOString(),
          false
        )
      : of([]);

    const reqTagsRounded = tagsNamesRounded?.length
      ? this.rtdbTagApiService.getTagHistoryByArray(
          tagsNamesRounded.map((v) => v.name),
          null,
          '0',
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferFromIndex].toISOString(),
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferToIndex].toISOString(),
          true
        )
      : of([]);

    const reqTagsActiveShapes = tagsNamesActiveShapes?.length
      ? this.rtdbTagApiService.getTagHistoryByArray(
          tagsNamesActiveShapes,
          null,
          '0',
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferFromIndex].toISOString(),
          this.playerService.dateObj.periodArr[this.playerService.dateObj.bufferToIndex].toISOString(),
          true
        )
      : of([]);

    return reqTags.pipe(
      combineLatestWith(reqTagsRounded, reqTagsActiveShapes),
      map(([tags1, tags2, tags3]) => {
        this.createData([...tags1, ...tags2, ...tags3]);
        return true;
      }),
      catchError((e) => {
        throw Error(e);
      })
    );
  }

  public createData(tags: ITagHistoryData[]): void {
    tags.forEach((tag) => {
      let tagM = this.playerService.tagMap.get(tag.name).defaultFormat;
      if (tag?.withFormat) {
        tagM = this.playerService.tagMap.get(tag.name).withFormat;
      }
      tag.points.forEach((p) => {
        tagM.set(new Date(p.time).setMilliseconds(0), { ...p, name: tag.name, withFormat: tag?.withFormat ?? false });
      });
    });

    let tag: ITagHistoryData;
    let i = 0;
    const endI = this.viewerTagService.tagsNamesOnly$.value?.length;
    while (!tag && endI) {
      tag = tags[i];
      // eslint-disable-next-line no-plusplus
      i++;
      if (tag?.points?.length) {
        break;
      }

      if (i === endI) {
        break;
      }
    }
    if (this.viewerService.mnemoUpdateType === 'ws' && this.viewerTagService.isTagsStart$.value) {
      if (!tag?.points?.length) {
        this.mnemoLoggerService.catchMessage('error', 'mnemo.ViewerPlayerComponent.loadingUnavailable');
      }

      this.viewerService.isLoadingViewer$.next(false);
    }
  }
}
