/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { mxCell, mxGraph } from 'mxgraph';
import { mx } from '../../../../../../config/mxObject';
import { StatusType } from '../../../../../../models';
import { ViewerHelperService, ViewerService } from '../../../../../pure-modules';
import { MnemoRuleService, IStyleAndValue } from '../mnemo-rule.service';
import { MnemoAbstractClass } from '../mnemo-abstract-class';

@Injectable()
export class MnemoValueApplyService implements MnemoAbstractClass {
  private readonly viewerService = inject(ViewerService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly graphRuleService = inject(MnemoRuleService);

  public graph: mxGraph;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public blinkRef: any = null;
  public blinkDelay: number = 1 * 1000; // мс
  public isNeedRefresh: boolean = true;
  private readonly baseUrl: string = '';

  private readonly blinkCellsMap: Map<string, mxCell> = new Map<string, mxCell>();

  constructor() {
    this.baseUrl = this.viewerService.baseUrl;
  }

  public init(graph: mxGraph): void {
    this.graph = graph;
  }

  public initSubscribe(): void {}

  public destroy(): void {
    this.clearBlinkInterval();
  }

  public checkRulesAndApplyCellValue(
    cell: mxCell,
    value: number = 0,
    status: StatusType = '',
    stringValue: string = null
  ): void {
    let resultRules: IStyleAndValue;
    if (cell.tagRules) {
      const defaultRul: {
        tagRules: string;
        tagDefStyle: Record<string, string> | null;
      } = this.graphRuleService.addDefaultValueMnemo(cell.getStyle(), cell.tagRules, cell.cellType);

      if (defaultRul) {
        cell.tagRules = defaultRul.tagRules;
        cell.tagDefStyle = defaultRul.tagDefStyle;
      }

      resultRules = this.graphRuleService.getStyleAndValueMnemo(
        cell.getStyle(),
        value,
        cell.tagRules,
        status,
        cell.cellType,
        cell.tagDefStyle
      );
      cell.setStyle(resultRules?.style);
    }

    if (resultRules?.blink) {
      cell.blink = resultRules?.blink;
      this.blinkCellsMap.set(cell.getId(), cell);
    } else {
      cell.setVisible(!resultRules?.invisible);
      cell.blink = 0;
      this.blinkCellsMap.delete(cell.getId());
    }
    if (stringValue !== null && Number(stringValue) === (resultRules?.value ?? value)) {
      this.applyCellValue(cell, stringValue, status);
      return;
    }
    this.applyCellValue(cell, resultRules?.value ?? value, status);
  }

  public applyCellValue(cell: mxCell, value: string | number = 0, status: StatusType = ''): void {
    if (cell.disableValue) {
      cell.setValue('');
      cell.hiddenValue = value;
    } else if (status === 'Bad') {
      cell.setValue('Bad');
    } else {
      cell.setValue(value);
    }

    if (cell.showWarning) {
      this.addErrorIcon(cell);
    }

    this.graph.refresh(cell);
  }

  public addErrorIcon(cell: mxCell): void {
    if (Date.now() - (cell.timeStamp as number) < 120000) {
      this.graph.removeCellOverlays(cell);
      return;
    }
    const overlays = this.graph.getCellOverlays(cell);
    if (!overlays) {
      // eslint-disable-next-line new-cap
      const overlay = new mx.mxCellOverlay(
        // eslint-disable-next-line new-cap
        new mx.mxImage(`${this.baseUrl}assets/deviation.svg`, 12, 12),
        `${this.viewerHelperService.getTranslate('incorrectTimeStamp')}`,
        'end',
        'top'
      );
      this.graph.addCellOverlay(cell, overlay);
    }
  }

  public setBlinkInterval(isFirst: boolean = false): void {
    if (isFirst) {
      this.isNeedRefresh = true;
    }
    if (this.isNeedRefresh) {
      const update = (): void => {
        this.blinkCellsMap.forEach((cell) => {
          if (cell?.blink) {
            cell.setVisible(!cell.visible);
          }
          this.graph.refresh(cell);
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
      cell.setVisible(true);
      cell.blink = 1;
      this.graph.refresh(cell);
    });
    this.blinkRef = null;
    this.isNeedRefresh = false;
  }
}
