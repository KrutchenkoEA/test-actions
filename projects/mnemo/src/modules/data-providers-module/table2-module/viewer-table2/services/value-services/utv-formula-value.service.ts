/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { IFormulaCalcRes, IMnemoUnsubscribed, IUTTableCellData } from '../../../../../../models';
import { RtdbFormulaApiService } from '../../../../../../services';
import { ViewerFormulaService, ViewerHelperService } from '../../../../../pure-modules';
import { UtvDataRefService } from '../utv-data-ref.service';
import { UtvValueApplyService } from './utv-value-apply.service';

@Injectable()
export class UtvFormulaValueService implements IMnemoUnsubscribed {
  public utvDataRefService = inject(UtvDataRefService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly valueApplyService = inject(UtvValueApplyService);
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);

  public subscriptions: Subscription[] = [];

  public initSubs(): void {
    const formulaSub$ = this.viewerFormulaService.formulaInit$.subscribe((v) => {
      if (!this.utvDataRefService?.univer) return;
      if (v) {
        this.viewerFormulaService.formulaCellsTableMap$.value?.forEach((cell) => this.setFormulaInterval(cell));
      } else {
        this.clearFormulaInterval();
      }
    });
    this.subscriptions.push(formulaSub$);
  }

  public destroySubs(): void {
    this.clearFormulaInterval(true);
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public setFormulaInterval(cell: IUTTableCellData): void {
    if (!cell?.custom) return;
    const interval = this.viewerFormulaService.formulaMap.get(cell.custom.id);
    if (!interval) {
      this.setFormulaValue(cell);
      this.viewerFormulaService.formulaMap.set(
        cell.custom.id,
        setInterval(() => this.setFormulaValue(cell), cell.custom.formulaInterval * 1000),
      );
    }
  }

  public clearFormulaInterval(cleanData: boolean = false): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const interval of this.viewerFormulaService.formulaMap.values()) {
      clearInterval(interval);
    }
    if (cleanData) {
      this.viewerFormulaService.cleanData();
    }
  }

  public setFormulaValue(cell: IUTTableCellData): void {
    const cellObject = cell.custom;
    this.rtdbFormulaApiService.getCalcByFormula<IFormulaCalcRes>(cellObject.formula).subscribe((res) => {
      if (res.result[0] !== cell.v) {
        cellObject.timeStamp = new Date()?.toLocaleString();
        cellObject.formulaValid = res.valid;
        cellObject.status = res?.valid ? 192 : 0;

        if (!cellObject.showUnits) {
          cellObject.unitName = '';
        }

        this.valueApplyService.checkRulesAndApplyCellValue(
          cell,
          res.result[0],
          this.viewerHelperService.getStatus(cellObject.status),
        );
      }
    });
  }
}
