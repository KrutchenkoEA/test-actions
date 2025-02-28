/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { mxCell, mxGraph, mxPopupMenuHandler } from 'mxgraph';
import { IFormulaData, MnemoGraphAbstract, ShapeTypeEnum, SourceType } from '../../../../../models';
import {
  TooltipTemplateService,
  ViewerFormulaService,
  ViewerHelperService,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../../../pure-modules';
import { MnemoPopupChartService } from '../../../../additional-modules';

@Injectable()
export class MnemoTooltipService implements MnemoGraphAbstract {
  private readonly viewerService = inject(ViewerService);
  private readonly viewerHelperService = inject(ViewerHelperService);
  private readonly tooltipTemplateService = inject(TooltipTemplateService);
  private readonly mnemoPopupChartService = inject(MnemoPopupChartService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOmService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);

  public graph: mxGraph;

  public init(graph: mxGraph): void {
    this.graph = graph;

    this.setHandlers();
  }

  public destroy(): void {
  }

  public setHandlers(): void {
    this.graph.popupMenuHandler.factoryMethod = (menu: mxPopupMenuHandler, cell): void => {
      if (!cell && !(this.viewerService.isViewerInit$.value && this.viewerService.isViewerInitActiveShapes$.value)) {
        return;
      }

      if (cell.isEdge() || cell.cellType === ShapeTypeEnum.ActiveElement) return;

      if (cell.sourceType === 'tag' || !cell.sourceType || cell.sourceType === 'om') {
        let tagName: string;
        if (cell?.tagName) {
          tagName = cell?.tagName;
        } else {
          tagName = cell?.getAttribute('tagName', null);
        }
        this.createMenu(menu, tagName, 'tag', cell);
      } else if (cell.sourceType === 'omAttr') {
        this.createMenu(menu, `${cell.attrParentPath} | ${cell.attrName}`, 'omAttr', cell);
      } else if (cell.sourceType === 'formula') {
        this.createMenu(menu, cell.formula, 'formula', cell);
      }

      this.createAdditionalMenu(menu);
    };

    this.graph.getTooltipForCell = (cell): string => {
      if (cell.isEdge()) return '';

      let tagName: string = '';
      if (cell?.tagName) {
        tagName = cell?.tagName;
      } else {
        tagName = cell?.getAttribute('tagName', null);
      }
      if (tagName?.length && (cell.sourceType === 'tag' || !cell?.sourceType || cell.sourceType === 'om')) {
        const cellValue = !cell?.disableValue ? cell.getValue() : cell.hiddenValue;
        return this.tooltipTemplateService.getTooltipTemplateTag(cellValue, tagName, cell.timeStamp, cell.status);
      }
      if (cell.sourceType === 'omAttr') {
        return this.tooltipTemplateService.getTooltipTemplateOM(
          cell.getValue(),
          `${cell.attrParentPath} | ${cell.attrName}`,
          cell.timeStamp,
          cell.status,
        );
      }
      if (cell.sourceType === 'formula') {
        return this.tooltipTemplateService.getTooltipTemplateFormula(
          cell.getValue(),
          cell.formula,
          cell.timeStamp,
          cell.formulaValid,
        );
      }

      return '';
    };
  }

  private showPopupChart(value: string, sourceType: SourceType, cell: Partial<mxCell> | Partial<IFormulaData>): void {
    this.mnemoPopupChartService.tooltipChartData$.next(cell);
    this.viewerService.hiddenChartOpt = false;
  }

  private createMenu(menu: mxPopupMenuHandler, name: string, sourceType: SourceType, cell: mxCell): void {
    if (this.viewerHelperService.getActiveLang() === 'fa') {
      menu.addItem(`${name} :${this.viewerHelperService.getTranslate('showChart')} `, null, () => {
        this.viewerService.hiddenChartOpt = false;
        this.showPopupChart(name, sourceType, cell);
      });
    } else {
      menu.addItem(`${this.viewerHelperService.getTranslate('showChart')}: ${name}`, null, () => {
        this.viewerService.hiddenChartOpt = false;
        this.showPopupChart(name, sourceType, cell);
      });
    }
  }

  private createAdditionalMenu(menu: mxPopupMenuHandler): void {
    menu.addSeparator();

    if (this.viewerTagService.tagsNamesOnly$.value?.length) {
      const multipleChartTag = menu.addItem(`${this.viewerHelperService.getTranslate('addTagToChart')}`, null, null);
      this.viewerTagService.tagsNamesOnly$.value?.forEach((tag) => {
        menu.addItem(
          tag,
          null,
          () => {
            this.viewerService.hiddenChartOpt = false;
            this.showPopupChart(tag, 'tag', { tagName: tag, sourceType: 'tag' });
          },
          multipleChartTag,
        );
      });
    }

    if (this.viewerOmService.omObjectMap$.value.size) {
      const multipleChartOm = menu.addItem(`${this.viewerHelperService.getTranslate('addOmToChart')}`, null, null);
      this.viewerOmService.omObjectMap$.value.forEach((cell) => {
        menu.addItem(
          `${cell.attrParentPath} | ${cell.attrName}`,
          null,
          () => {
            this.viewerService.hiddenChartOpt = false;
            cell.sourceType = 'omAttr';
            this.showPopupChart(cell.attrName, 'omAttr', cell);
          },
          multipleChartOm,
        );
      });
    }

    if (this.viewerFormulaService.formulaObjectMap$.value.size) {
      const multipleChartFormula = menu.addItem(
        `${this.viewerHelperService.getTranslate('addFormulaToChart')}`,
        null,
        null,
      );
      this.viewerFormulaService.formulaObjectMap$.value.forEach((cell) => {
        menu.addItem(
          cell.formula,
          null,
          () => {
            this.viewerService.hiddenChartOpt = false;
            cell.sourceType = 'formula';
            this.showPopupChart(cell.formula, 'formula', cell);
          },
          multipleChartFormula,
        );
      });
    }
  }
}
