/* eslint-disable import/no-extraneous-dependencies */
import { ElementRef, Injectable, inject } from '@angular/core';
import { mxCell, mxGraph } from 'mxgraph';
import { forkJoin, Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { IMnemoEvent, ITagsValues, ShapeTypeEnum, ViewElementTypeEnum } from '../../../../../../models';
import { RtdbTagApiService } from '../../../../../../services';
import {
  PlayerModeService,
  ViewerHelperService,
  ViewerIntervalService,
  ViewerService,
  ViewerTagService,
} from '../../../../../pure-modules';
import { MnemoRuleService } from '../mnemo-rule.service';
import { MnemoAbstractClass } from '../mnemo-abstract-class';
import { MnemoValueApplyService } from './mnemo-value-apply.service';

@Injectable()
export class MnemoTagService implements MnemoAbstractClass {
  viewerService = inject(ViewerService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly valueApplyService = inject(MnemoValueApplyService);
  private readonly graphRuleService = inject(MnemoRuleService);
  private readonly rtdbTagApiService = inject(RtdbTagApiService);

  public graph: mxGraph;
  public graphContainer: ElementRef<HTMLElement>;
  public subscriptions: Subscription[] = [];

  public init(graph: mxGraph, graphContainer: ElementRef<HTMLElement>): void {
    this.graph = graph;
    this.graphContainer = graphContainer;
  }

  public initSubscribe(): void {
    if (this.viewerService.mnemoViewerType === 'rest') {
      const intervalSub$ = this.viewerIntervalService.intervalTicks$
        .pipe(filter(() => !this.playerModeService.isPlayerMode && this.viewerTagService.isTagsInit$.value))
        .subscribe(() => this.getData());

      this.subscriptions.push(intervalSub$);
    }

    const tagUpdateSub$ = this.viewerTagService.updateTagData$.pipe(filter((d) => !!d?.length)).subscribe((d) => {
      if (!this.graph) return;
      this.updateValues(d);
    });

    const playerSub$ = this.viewerTagService.updateTagDataPlayer$.pipe(filter((d) => !!d?.length)).subscribe((d) => {
      if (!this.graph) return;
      this.updateValues(d);
    });

    const metaInfoSub$ = this.viewerTagService.updateTagsMetaInfo$.subscribe(() => {
      if (!this.graph) return;
      this.updateMetaInfo();
    });

    this.subscriptions.push(tagUpdateSub$);
    this.subscriptions.push(playerSub$);
    this.subscriptions.push(metaInfoSub$);
  }

  public destroy(): void {
    this.viewerTagService.cleanData();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private getData(): void {
    if (!this.viewerTagService.tagsNames$.value?.length) return;
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
        })
      ),
    ]).subscribe(([tagValues, tagValues2]) => {
      this.viewerTagService.updateTagData$.next([...tagValues, ...tagValues2]);
    });
  }

  private updateValues(data: ITagsValues[]): void {
    this.viewerTagService.tagCellsMnemoSet?.forEach((cell) => this.setValue(data, cell));
  }

  private updateMetaInfo(): void {
    this.viewerTagService.tagCellsMnemoSet?.forEach((cell) => {
      if (cell?.showUnits) {
        const unit = this.viewerTagService.tagMetaInfoMap.get(cell.tagName)?.unitName;
        if (unit) {
          cell.unitName = unit === 'Нет' ? '' : unit;
        } else {
          cell.unitName = '';
        }
      }
      this.graph.refresh(cell);
    });
  }

  private setValue(data: ITagsValues[], cell: mxCell): void {
    let dataObj: ITagsValues = null;

    if (cell?.roundValue) {
      dataObj = data.find((tag) => tag?.name === cell.tagName && tag.withFormat);
    }

    if (!dataObj) {
      dataObj = data.find((tag) => tag?.name === cell.tagName && !tag.withFormat);
    }

    if (dataObj && dataObj?.val !== cell.getValue() && new Date(cell?.timeStamp) !== new Date(dataObj?.time)) {
      cell.timeStamp = dataObj?.time ? new Date(dataObj.time) : new Date(-1);
      cell.status = dataObj?.status ?? 0;

      const status = this.viewerHelperService.getStatus(cell.status);

      if (cell?.showUnits) {
        const unit = this.viewerTagService.tagMetaInfoMap.get(cell.tagName)?.unitName;
        if (unit) {
          cell.unitName = unit === 'Нет' ? '' : unit;
        } else {
          cell.unitName = '';
        }
      }

      if (cell?.tagName?.length > 0 && cell.cellType !== ShapeTypeEnum.ActiveElement) {
        this.valueApplyService.checkRulesAndApplyCellValue(
          cell,
          dataObj.val,
          status,
          cell.roundValue ? dataObj.val?.toString() : null
        );
      } else if (
        cell.cellType === ShapeTypeEnum.ActiveElement &&
        cell.viewElementType === ViewElementTypeEnum.VerticalProgressBar
      ) {
        this.setActiveElementVal(dataObj, cell);
      }

      if (cell.loadEvents && !this.viewerService.disableEvents && dataObj?.guid) {
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

  private setActiveElementVal(dataObj: ITagsValues, cell: mxCell): void {
    const val = dataObj?.val ?? 0;
    const activeElement = this.graphRuleService.getValueActiveElementMnemo(cell, val);
    const gradientCell = document.getElementById(activeElement.id);

    if (gradientCell) {
      gradientCell.remove();
    }
    this.graphContainer.nativeElement.firstElementChild?.appendChild(activeElement.gradient);
    const style = this.graphRuleService.fillActiveElementMnemo(activeElement.id);
    cell.setStyle(style);

    if (cell.disableValue) {
      cell.setValue('');
      cell.hiddenValue = val;
    } else {
      cell.setValue(val);
    }
    this.graph.refresh(cell);
  }
}
