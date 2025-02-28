/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { mxCell, mxGraph } from 'mxgraph';
import { Subscription } from 'rxjs';
import { IFormulaCalcRes, ShapeTypeEnum } from '../../../../../../models';
import { RtdbFormulaApiService } from '../../../../../../services';
import { MnemoAbstractClass } from '../mnemo-abstract-class';
import { ViewerFormulaService, ViewerHelperService, ViewerService } from '../../../../../pure-modules';
import { MnemoValueApplyService } from './mnemo-value-apply.service';

@Injectable()
export class MnemoFormulaService implements MnemoAbstractClass {
  viewerService = inject(ViewerService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly valueApplyService = inject(MnemoValueApplyService);
  private readonly rtdbFormulaApiService = inject(RtdbFormulaApiService);

  public graph: mxGraph;
  public subscriptions: Subscription[] = [];

  public init(graph: mxGraph): void {
    this.graph = graph;
  }

  public initSubscribe(): void {
    const formulaSub$ = this.viewerFormulaService.formulaInit$.subscribe((v) => {
      if (!this.graph) return;
      if (v) {
        this.viewerFormulaService.formulaSetMnemo$.value?.forEach((cell) => this.setFormulaInterval(cell));
      } else {
        this.clearFormulaInterval();
      }
    });

    this.subscriptions.push(formulaSub$);
  }

  public destroy(): void {
    this.clearFormulaInterval(true);
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public setFormulaInterval(cell: mxCell): void {
    const interval = this.viewerFormulaService.formulaMap.get(cell.getId());
    if (!interval) {
      this.setFormulaValue(cell);
      this.viewerFormulaService.formulaMap.set(
        cell.getId(),
        setInterval(() => this.setFormulaValue(cell), cell.formulaInterval * 1000)
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

  public setFormulaValue(cell: mxCell): void {
    this.rtdbFormulaApiService.getCalcByFormula<IFormulaCalcRes>(cell.formula).subscribe((res) => {
      if (res.result[0] !== cell.getValue()) {
        cell.timeStamp = new Date()?.toLocaleString();
        cell.formulaValid = res.valid;
        cell.status = res?.valid ? 192 : 0;

        if (!cell?.showUnits) {
          cell.unitName = '';
        }

        if (cell.cellType !== ShapeTypeEnum.ActiveElement) {
          this.valueApplyService.checkRulesAndApplyCellValue(
            cell,
            res.result[0] as number,
            this.viewerHelperService.getStatus(cell.status)
          );
        }
      }
    });
  }
}
