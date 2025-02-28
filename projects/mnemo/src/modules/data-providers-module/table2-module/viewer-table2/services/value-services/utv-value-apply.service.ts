/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { IStyleData } from '@univerjs/core';
import { mxGraph } from 'mxgraph';
import { IUTTableCellData, StatusType } from '../../../../../../models';
import { UtTlCellDataService } from '../../../components/univer-table-tl';
import { IStyleAndValueTable2, UtvRuleService } from '../utv-rule.service';
import { UtvValueAbstractClass } from '../utv-value-abstract.class';

@Injectable()
export class UtvValueApplyService implements UtvValueAbstractClass {
  private readonly uttlCellDataService = inject(UtTlCellDataService);
  private readonly utvRuleService = inject(UtvRuleService);

  public graph: mxGraph;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public blinkRef: any = null;
  public blinkDelay: number = 1 * 1000; // мс
  public isNeedRefresh: boolean = true;
  private readonly baseUrl: string = '';

  private readonly blinkCellsMap: Map<string, IUTTableCellData> = new Map<string, IUTTableCellData>();

  public init(): void {}

  public initSubscribe(): void {}

  public destroy(): void {
    this.clearBlinkInterval();
  }

  public checkRulesAndApplyCellValue(cell: IUTTableCellData, value: number = 0, status: StatusType = ''): void {
    let resultRules: IStyleAndValueTable2;
    const cellObject = cell?.custom;
    let style: IStyleData = this.uttlCellDataService.getCellStyle(cellObject.ri, cellObject.ci);

    if (cellObject?.tagRules) {
      const defaultRul: {
        tagRules: string;
        tagDefStyle: Record<string, string> | null;
      } = this.utvRuleService.addDefaultValueTable(style, cellObject.tagRules);

      if (defaultRul) {
        cellObject.tagRules = defaultRul.tagRules;
        cellObject.tagDefStyle = defaultRul.tagDefStyle;
      }

      resultRules = this.utvRuleService.getStyleAndValueTable(
        style,
        value,
        cellObject.tagRules,
        status,
        cellObject.tagDefStyle
      );
    }

    if (resultRules?.style && !style) {
      this.uttlCellDataService.getFRange(cellObject.ri, cellObject.ci).setFontLine('underline');
      style = this.uttlCellDataService.getCellStyle(cellObject.ri, cellObject.ci);
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const key in resultRules?.style) {
      if (style) {
        style[key] = resultRules.style[key];
      }
    }

    this.uttlCellDataService.getFRange(cellObject.ri, cellObject.ci).setFontLine('none');

    if (resultRules?.blink) {
      cellObject.blink = resultRules?.blink;
      this.blinkCellsMap.set(cellObject.id, cell);
    } else {
      // @ts-ignore
      cellObject.hiddenValue = cell.v;
      cellObject.visible = !resultRules?.invisible;
      cellObject.blink = 0;
      this.blinkCellsMap.delete(cellObject.id);
    }
    this.applyCellValue(
      cell,
      (resultRules?.value ?? value) + (cell?.custom?.unitName ? ` ${cell?.custom?.unitName}` : ''),
      status
    );
  }

  public applyCellValue(cell: IUTTableCellData, value: string | number = 0, status: StatusType = ''): void {
    if (cell.custom.disableValue) {
      cell.custom.hiddenValue = value;
      this.uttlCellDataService.setCellData(cell.custom.ri, cell.custom.ci, value);
    } else if (status === 'Bad') {
      this.uttlCellDataService.setCellData(cell.custom.ri, cell.custom.ci, 'Bad');
    } else {
      this.uttlCellDataService.setCellData(cell.custom.ri, cell.custom.ci, value);
    }

    if (cell.custom?.showWarning) {
      this.addErrorIcon();
    }
  }

  public addErrorIcon(): void {}

  public setBlinkInterval(isFirst: boolean = false): void {
    if (isFirst) {
      this.isNeedRefresh = true;
    }
    if (this.isNeedRefresh) {
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      const update = () => {
        this.blinkCellsMap.forEach((cell) => {
          if (cell?.custom?.blink) {
            cell.custom.visible = !cell.custom.visible;
            this.uttlCellDataService.setCellData(
              cell.custom.ri,
              cell.custom.ci,
              cell?.custom?.visible ? cell.custom.hiddenValue : ''
            );
          }
        });
      };
      this.blinkRef = setTimeout(() => {
        update();
        this.setBlinkInterval();
      }, this.blinkDelay);
    }
  }

  public clearBlinkInterval(): void {
    clearTimeout(this.blinkRef);
    this.blinkCellsMap?.forEach((cell) => {
      cell.custom.visible = true;
      cell.custom.blink = 1;
      this.uttlCellDataService.setCellData(cell.custom.ri, cell.custom.ci, cell.custom.hiddenValue);
    });
    this.blinkRef = null;
    this.isNeedRefresh = false;
  }
}
