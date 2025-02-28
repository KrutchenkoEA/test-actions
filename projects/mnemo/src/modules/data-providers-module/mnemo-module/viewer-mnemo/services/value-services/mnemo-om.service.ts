/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { mxCell, mxGraph } from 'mxgraph';
import { BehaviorSubject, combineLatest, debounceTime, filter, forkJoin, Subscription } from 'rxjs';
import {
  PlayerModeService,
  ViewerHelperService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerService,
} from '../../../../../pure-modules';
import { MnemoAbstractClass } from '../mnemo-abstract-class';
import { IMnemoEvent, IOMAttributeAll, IOMAttributeValues } from '../../../../../../models';
import { MnemoValueApplyService } from './mnemo-value-apply.service';
import { RtdbOmApiService } from '../../../../../../services';

@Injectable()
export class MnemoOmService implements MnemoAbstractClass {
  viewerService = inject(ViewerService);
  playerModeService = inject(PlayerModeService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly valueApplyService = inject(MnemoValueApplyService);
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);

  public graph: mxGraph;
  public subscriptions: Subscription[] = [];

  public update$: BehaviorSubject<IOMAttributeAll[]> = new BehaviorSubject<IOMAttributeAll[]>([]);
  public updateRounded$: BehaviorSubject<IOMAttributeAll[]> = new BehaviorSubject<IOMAttributeAll[]>([]);

  public init(graph: mxGraph): void {
    this.graph = graph;
  }

  public initSubscribe(): void {
    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(filter(() => !this.playerModeService.isPlayerMode && this.viewerOMService.omAttrInit$.value))
      .subscribe(() => this.getData());

    const combineSub$ = combineLatest([this.update$, this.updateRounded$])
      .pipe(debounceTime(1000))
      .subscribe(([v, v2]) => this.viewerOMService.updateOmData$.next([...v, ...v2]));

    const playerSub$ = this.viewerOMService.updateOmDataPlayer$
      .pipe(filter((d) => !!d?.length))
      .subscribe((d) => this.viewerOMService.omSetMnemo$.value.forEach((cell) => this.updateValue(cell, d)));

    this.subscriptions.push(intervalSub$);
    this.subscriptions.push(combineSub$);
    this.subscriptions.push(playerSub$);
  }

  public destroy(): void {
    this.viewerOMService.cleanData();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private getData(): void {
    const defaultMap = this.viewerOMService.omAttrMap.get('default');
    const roundedMap = this.viewerOMService.omAttrMap.get('rounded');

    if (defaultMap.size) {
      forkJoin(
        Array.from(defaultMap.keys()).map((elementId) => this.rtdbOmApiService.getOMAttributeAll(elementId, false))
      ).subscribe((attr) => {
        attr?.forEach((d) => {
          const dataMap = this.viewerOMService.omAttrMapData.get('default').get(d.id);
          defaultMap.get(d.id)?.forEach((t) => {
            const data = d?.attributes?.find((a) => a.id === t);
            if (data?.value) {
              dataMap.set(t, [{ ...data.value, unitName: data.unitsOfMeasure }]);
            }
          });
        });
        this.updateValues();
        this.update$.next(attr);
      });
    }

    if (roundedMap.size) {
      forkJoin(
        Array.from(roundedMap.keys()).map((elementId) => this.rtdbOmApiService.getOMAttributeAll(elementId, true))
      ).subscribe((attrWithFormat) => {
        attrWithFormat?.forEach((d) => {
          const dataMap = this.viewerOMService.omAttrMapData.get('rounded').get(d.id);
          roundedMap.get(d.id)?.forEach((t) => {
            const data = d?.attributes?.find((a) => a.id === t);
            if (data?.value) {
              dataMap.set(t, [{ ...data.value, unitName: data.unitsOfMeasure }]);
            }
          });
        });
        this.updateValues();
        this.updateRounded$.next(attrWithFormat);
      });
    }
  }

  private updateValues(): void {
    this.viewerOMService.omSetMnemo$.value?.forEach((cell) => this.setValue(cell));
  }

  private updateValue(cell: mxCell, data: IOMAttributeValues[]): void {
    let dataObj: IOMAttributeValues = null;

    if (cell?.roundValue) {
      dataObj = data.find((attr) => attr?.attributeId === cell.attrGuid && attr.withFormat);
    }

    if (!dataObj) {
      dataObj = data.find((attr) => attr?.attributeId === cell.attrGuid && !attr.withFormat);
    }

    if (!dataObj || (dataObj.value === cell.getValue() && new Date(cell?.timeStamp) === new Date(dataObj?.timeStamp)))
      return;
    this.applyValue(cell, dataObj);
  }

  private setValue(cell: mxCell): void {
    let data = null;
    // eslint-disable-next-line eqeqeq
    if (cell.roundValue == 1) {
      data = this.viewerOMService.omAttrMapData.get('rounded').get(cell.attrParentGuid).get(cell.attrGuid)?.[0];
    } else {
      data = this.viewerOMService.omAttrMapData.get('default').get(cell.attrParentGuid).get(cell.attrGuid)?.[0];
    }

    if (!data || data.value === cell.getValue()) return;

    this.applyValue(cell, data);
  }

  private applyValue(cell: mxCell, data: IOMAttributeValues): void {
    cell.timeStamp = new Date(data.timeStamp)?.toLocaleString();
    cell.status = data.isGood ? 192 : 0;
    if (cell?.showUnits) {
      if (data.unitName) {
        cell.unitName = data.unitName === 'Нет' ? '' : data.unitName;
      } else {
        cell.unitName = '';
      }
    }

    const status = this.viewerHelperService.getStatus(cell.status);

    if (cell?.loadEvents && !this.viewerService.disableEvents && data) {
      const event: IMnemoEvent = {
        id: `${cell.attrParentGuid} | ${cell.attrGuid}`,
        timestamp: data.timeStamp,
        value: data.value,
        status,
        name: `${cell.attrParentPath} | ${cell.attrName}`,
        sourceType: 'omAttr',
      };
      this.viewerOMService.omEventsHistory$.next(event);
    }

    if (data.valueType === 'System.Int32' || data.valueType === 'System.Int16' || data.valueType === 'System.Double') {
      this.valueApplyService.checkRulesAndApplyCellValue(
        cell,
        Number(data.value ?? 0),
        status,
        cell.roundValue ? data.value?.toString() : null
      );
    } else {
      this.valueApplyService.applyCellValue(cell, data?.value ?? cell.attrName, status);
    }
  }
}
