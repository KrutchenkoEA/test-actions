/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, debounceTime, filter, forkJoin, Subscription } from 'rxjs';
import { IMnemoUnsubscribed, IOMAttributeAll, IOMAttributeValues, IUTTableCellData } from '../../../../../../models';
import { RtdbOmApiService } from '../../../../../../services';
import {
  PlayerModeService,
  ViewerHelperService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerService,
} from '../../../../../pure-modules';
import { UtvDataRefService } from '../utv-data-ref.service';
import { UtvValueApplyService } from './utv-value-apply.service';

@Injectable()
export class UtvOmValueService implements IMnemoUnsubscribed {
  public utvDataRefService = inject(UtvDataRefService);
  public viewerService = inject(ViewerService);
  private readonly playerModeService = inject(PlayerModeService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly valueApplyService = inject(UtvValueApplyService);
  private readonly rtdbOmApiService = inject(RtdbOmApiService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);

  public subscriptions: Subscription[] = [];

  public update$: BehaviorSubject<IOMAttributeAll[]> = new BehaviorSubject<IOMAttributeAll[]>([]);
  public updateRounded$: BehaviorSubject<IOMAttributeAll[]> = new BehaviorSubject<IOMAttributeAll[]>([]);

  public initSubs(): void {
    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(filter(() => !this.playerModeService.isPlayerMode && this.viewerOMService.omAttrInit$.value))
      .subscribe(() => {
        if (!this.utvDataRefService?.univer) return;
        this.getData();
      });

    const combineSub$ = combineLatest([this.update$, this.updateRounded$])
      .pipe(debounceTime(1000))
      .subscribe(([v, v2]) => this.viewerOMService.updateOmData$.next([...v, ...v2]));

    const playerSub$ = this.viewerOMService.updateOmDataPlayer$.pipe(filter((d) => !!d?.length)).subscribe((d) => {
      if (!this.utvDataRefService?.univer) return;
      this.viewerOMService.omMapTable$.value.forEach((cell) => this.updateValue(cell, d));
    });

    this.subscriptions.push(intervalSub$);
    this.subscriptions.push(combineSub$);
    this.subscriptions.push(playerSub$);
  }

  public destroySubs(): void {
    this.viewerOMService.cleanData();
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  private getData(): void {
    const defaultMap = this.viewerOMService.omAttrMap.get('default');
    const roundedMap = this.viewerOMService.omAttrMap.get('rounded');

    if (defaultMap.size) {
      forkJoin(
        Array.from(defaultMap.keys()).map((elementId) => this.rtdbOmApiService.getOMAttributeAll(elementId, false)),
      ).subscribe((attr) => {
        attr?.forEach((d) => {
          const dataMap = this.viewerOMService.omAttrMapData.get('default').get(d.id);
          defaultMap.get(d.id)?.forEach((t) => {
            const data = d?.attributes?.find((a) => a.id === t);
            if (data?.value) {
              dataMap.set(t, [data.value]);
            }
          });
        });
        this.updateValues();
        this.update$.next(attr);
      });
    }

    if (roundedMap.size) {
      forkJoin(
        Array.from(roundedMap.keys()).map((elementId) => this.rtdbOmApiService.getOMAttributeAll(elementId, true)),
      ).subscribe((attrWithFormat) => {
        attrWithFormat?.forEach((d) => {
          const dataMap = this.viewerOMService.omAttrMapData.get('default').get(d.id);
          roundedMap.get(d.id)?.forEach((t) => {
            const data = d?.attributes?.find((a) => a.id === t);
            if (data?.value) {
              dataMap.set(t, [data.value]);
            }
          });
        });
        this.updateValues();
        this.updateRounded$.next(attrWithFormat);
      });
    }
  }

  private updateValues(): void {
    this.viewerOMService.omMapTable$.value?.forEach((cell) => this.setValue(cell));
  }

  private updateValue(cell: IUTTableCellData, data: IOMAttributeValues[]): void {
    const cellObject = cell?.custom;
    if (!cellObject) return;

    let dataObj: IOMAttributeValues = null;
    if (cellObject?.roundValue) {
      dataObj = data.find((attr) => attr?.attributeId === cellObject.attrGuid && attr.withFormat);
    }

    if (!dataObj) {
      dataObj = data.find((attr) => attr?.attributeId === cellObject.attrGuid && !attr.withFormat);
    }

    if (!dataObj || (dataObj.value === cell.v && new Date(cellObject?.timeStamp) === new Date(dataObj?.timeStamp)))
      return;
    this.applyValue(cell, dataObj);
  }

  private setValue(cell: IUTTableCellData): void {
    const cellObject = cell?.custom;
    if (!cellObject) return;

    let data = null;
    // eslint-disable-next-line eqeqeq
    if (cellObject.roundValue == 1) {
      data = this.viewerOMService.omAttrMapData
        .get('rounded')
        .get(cellObject.attrParentGuid)
        .get(cellObject.attrGuid)?.[0];
    } else {
      data = this.viewerOMService.omAttrMapData
        .get('default')
        .get(cellObject.attrParentGuid)
        .get(cellObject.attrGuid)?.[0];
    }

    if (!data || data.value === cell.v) return;

    this.applyValue(cell, data);
  }

  private applyValue(cell: IUTTableCellData, data: IOMAttributeValues): void {
    const cellObject = cell?.custom;
    cellObject.timeStamp = new Date(data.timeStamp)?.toLocaleString();
    cellObject.status = data.isGood ? 192 : 0;
    if (!cellObject?.showUnits) {
      cellObject.unitName = '';
    }

    const status = this.viewerHelperService.getStatus(cellObject.status);

    if (data.valueType === 'System.Int32' || data.valueType === 'System.Int16' || data.valueType === 'System.Double') {
      this.valueApplyService.checkRulesAndApplyCellValue(cell, Number(data.value ?? 0), status);
    } else {
      this.valueApplyService.applyCellValue(cell, data?.value ?? cellObject.attrName, status);
    }
  }
}
