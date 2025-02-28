/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { IHoverCellPosition } from '@univerjs/sheets-ui';
import { BehaviorSubject, debounceTime, Subscription } from 'rxjs';
import { IMnemoUnsubscribed, IUTTableCellDataCustom } from '../../../../../models';
import {
  TooltipTemplateService,
  ViewerFormulaService,
  ViewerOMService,
  ViewerTagService,
} from '../../../../pure-modules';
import { UtTlCellDataService } from '../../components/univer-table-tl';
import { UtvDataRefService } from './utv-data-ref.service';

@Injectable()
export class UtvTooltipService implements IMnemoUnsubscribed {
  private readonly utvDataRefService = inject(UtvDataRefService);
  private readonly uttlCellDataService = inject(UtTlCellDataService);
  private readonly tooltipTemplateService = inject(TooltipTemplateService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOmService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);

  public subscriptions: Subscription[] = [];
  public cell$: BehaviorSubject<IHoverCellPosition | null> = new BehaviorSubject<IHoverCellPosition | null>(null);
  public tooltipPosition$: BehaviorSubject<{
    left: number;
    top: number;
    ri: number;
    ci: number;
  }> = new BehaviorSubject(null);

  public initSubs(): void {
    this.utvDataRefService.univerAPI
      .getSheetHooks()
      .onCellPointerMove((cell) => this.cell$.next(cell as IHoverCellPosition));

    const cellSub$ = this.cell$.pipe(debounceTime(100)).subscribe((cell) => {
      if (!cell?.location) {
        this.tooltipPosition$.next(null);
        return;
      }
      this.tooltipPosition$.next({
        left: cell.position.startX,
        top: cell.position.startY,
        ri: cell.location.row,
        ci: cell.location.col,
      });
    });

    this.subscriptions.push(cellSub$);
  }

  public destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public getTootlip(ri: number, ci: number): string {
    if (ri === null || ci === null) {
      document.getElementById('mxTooltip').innerHTML = '';
      this.tooltipPosition$.next(null);
      return '';
    }
    const cell = this.uttlCellDataService.getCellData(ri, ci);
    const key = this.uttlCellDataService.getCellId(ri, ci);
    const sourceType = (cell?.custom as IUTTableCellDataCustom)?.sourceType;

    if (!sourceType) {
      document.getElementById('mxTooltip').innerHTML = '';
      this.tooltipPosition$.next(null);
      return '';
    }

    let data: IUTTableCellDataCustom;

    switch (sourceType) {
      case 'tag':
        data = this.viewerTagService.tagCellsTableMap.get(key)?.custom;
        document.getElementById('mxTooltip').innerHTML = this.tooltipTemplateService.getTooltipTemplateTag(
          cell.v as string,
          data?.tagName,
          new Date(data?.timeStamp),
          data?.status as number,
        );
        break;
      case 'omAttr':
        data = this.viewerOmService.omMapTable$.value.get(key)?.custom;
        document.getElementById('mxTooltip').innerHTML = this.tooltipTemplateService.getTooltipTemplateOM(
          cell.v as string,
          `${data?.attrParentPath} | ${data?.attrName}`,
          new Date(data?.timeStamp),
          data?.status as number,
        );
        break;
      case 'formula':
        data = this.viewerFormulaService.formulaCellsTableMap$.value.get(key)?.custom;
        document.getElementById('mxTooltip').innerHTML = this.tooltipTemplateService.getTooltipTemplateFormula(
          cell.v as string,
          data?.formula,
          new Date(data?.timeStamp),
          data?.formulaValid,
        );
        break;
      default:
        break;
    }
    this.tooltipPosition$.next(null);
    return '';
  }
}
