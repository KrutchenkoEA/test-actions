/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IMnemoEvent, IMnemoUnsubscribed, ITagsValues, IUTTableCellData } from '../../../../../../models';
import { RtdbTagApiService } from '../../../../../../services';
import {
  PlayerModeService,
  ViewerHelperService,
  ViewerIntervalService,
  ViewerService,
  ViewerTagService,
} from '../../../../../pure-modules';
import { UtTlCellDataService } from '../../../components/univer-table-tl';
import { UtvDataRefService } from '../utv-data-ref.service';
import { UtvValueApplyService } from './utv-value-apply.service';

@Injectable()
export class UtvTagValueService implements IMnemoUnsubscribed {
  public utvDataRefService = inject(UtvDataRefService);
  public viewerService = inject(ViewerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly valueApplyService = inject(UtvValueApplyService);
  private readonly uttlCellDataService = inject(UtTlCellDataService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);

  public subscriptions: Subscription[] = [];

  public initSubs(): void {
    if (this.viewerService.mnemoViewerType === 'rest') {
      const intervalSub$ = this.viewerIntervalService.intervalTicks$
        .pipe(filter(() => !this.playerModeService.isPlayerMode && this.viewerTagService.isTagsInit$.value))
        .subscribe(() => this.getData());

      this.subscriptions.push(intervalSub$);
    }

    const tagUpdateSub$ = this.viewerTagService.updateTagData$.pipe(filter((d) => !!d?.length)).subscribe((d) => {
      if (!this.utvDataRefService?.univer) return;
      this.updateValues(d);
    });

    const playerSub$ = this.viewerTagService.updateTagDataPlayer$.pipe(filter((d) => !!d?.length)).subscribe((d) => {
      if (!this.utvDataRefService?.univer) return;
      this.updateValues(d);
    });

    const metaInfoSub$ = this.viewerTagService.updateTagsMetaInfo$.subscribe(() => {
      if (!this.utvDataRefService?.univer) return;
      this.updateMetaInfo();
    });

    this.subscriptions.push(tagUpdateSub$);
    this.subscriptions.push(playerSub$);
    this.subscriptions.push(metaInfoSub$);
  }

  public destroySubs(): void {
    this.viewerTagService.cleanData();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private getData(): void {
    if (this.viewerTagService.tagsNames$.value?.length) {
      const tagsNames = this.viewerTagService.tagsNames$.value.filter((t) => !t?.roundValue)?.map((t) => t.name);
      const tagsNamesRounded = this.viewerTagService.tagsNames$.value.filter((t) => t?.roundValue)?.map((t) => t.name);
      forkJoin([
        this.rtdbTagApiService.getTagValueByArray(tagsNames, false),
        this.rtdbTagApiService.getTagValueByArray(tagsNamesRounded, true).pipe(
          map((tagValues) => {
            tagValues.forEach((v) => {
              v.val = Number(v.val);
              v.withFormat = true;
            });
            return tagValues;
          }),
        ),
      ]).subscribe(([tagValues, tagValues2]) => {
        this.viewerTagService.updateTagData$.next([...tagValues, ...tagValues2]);
      });
    }
  }

  private updateValues(data: ITagsValues[]): void {
    this.viewerTagService.tagCellsTableMap?.forEach((cell) => this.setValue(data, cell));
  }

  private updateMetaInfo(): void {
    this.viewerTagService.tagCellsTableMap?.forEach((cell) => {
      if (cell?.custom?.showUnits) {
        const unit = this.viewerTagService.tagMetaInfoMap.get(cell?.custom?.tagName)?.unitName;
        if (unit) {
          cell.custom.unitName = unit === 'Нет' ? '' : unit;
        } else {
          cell.custom.unitName = '';
        }

        this.uttlCellDataService.setCellData(
          cell.custom.ri,
          cell.custom.ci,
          cell.v + (cell?.custom?.unitName ? ` ${cell?.custom?.unitName}` : ''),
        );
      }
    });
  }

  private setValue(data: ITagsValues[], cell: IUTTableCellData): void {
    if (!cell?.custom) return;

    let dataObj: ITagsValues = null;
    const cellObject = cell.custom;

    if (cellObject?.roundValue) {
      dataObj = data.find((tag) => tag?.name === cellObject?.tagName && tag.withFormat);
    }

    if (!dataObj) {
      dataObj = data.find((tag) => tag?.name === cellObject?.tagName && !tag.withFormat);
    }

    // eslint-disable-next-line eqeqeq
    if (dataObj && dataObj?.val !== cell.v && new Date(cell?.custom?.timeStamp) != new Date(dataObj?.time)) {
      cellObject.timeStamp = dataObj?.time ? new Date(dataObj.time) : new Date(-1);
      cellObject.status = dataObj?.status ?? 0;

      const status = this.viewerHelperService.getStatus(cellObject.status);

      const { tagName } = cell.custom;

      if (cellObject?.showUnits) {
        const unit = this.viewerTagService.tagMetaInfoMap.get(cellObject?.tagName)?.unitName;
        if (unit) {
          cellObject.unitName = unit === 'Нет' ? '' : unit;
        } else {
          cellObject.unitName = '';
        }
      }
      const nameIdMapItem = this.viewerTagService.tagNameIdMap;

      if (tagName && !nameIdMapItem.get(tagName)) {
        nameIdMapItem.set(tagName, dataObj.id);
      }

      const nameGuidMapItem = this.viewerTagService.tagNameGuidMap;
      if (tagName && !nameGuidMapItem.get(tagName)) {
        nameGuidMapItem.set(tagName, dataObj.guid);
      }

      if (cellObject?.tagName?.length > 0) {
        this.valueApplyService.checkRulesAndApplyCellValue(cell, dataObj.val, status);
      }

      if (cellObject.loadEvents && !this.viewerService.disableEvents && dataObj?.guid) {
        const event: IMnemoEvent = {
          id: dataObj.guid,
          timestamp: dataObj.time,
          value: dataObj.val,
          status,
          name: dataObj.name,
          sourceType: 'tag',
        };
        this.viewerTagService.tagEventsHistory$.next(event);
      }
    }
  }
}
