/* eslint-disable import/no-extraneous-dependencies */
import { ElementRef, Injectable } from '@angular/core';
import { Univer } from '@univerjs/core';
import { UniverDataValidationPlugin } from '@univerjs/data-validation';
import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsConditionalFormattingUIPlugin } from '@univerjs/sheets-conditional-formatting-ui';
import { UniverSheetsCrosshairHighlightPlugin } from '@univerjs/sheets-crosshair-highlight';
import { UniverSheetsDataValidationPlugin } from '@univerjs/sheets-data-validation';
import { UniverSheetsDataValidationUIPlugin } from '@univerjs/sheets-data-validation-ui';
import { UniverSheetsFilterPlugin } from '@univerjs/sheets-filter';
import { UniverSheetsFindReplacePlugin } from '@univerjs/sheets-find-replace';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsSortPlugin } from '@univerjs/sheets-sort';
import { UniverSheetsSortUIPlugin } from '@univerjs/sheets-sort-ui';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverUIPlugin } from '@univerjs/ui';
// @ts-ignore
import { IUniverUIConfig } from '@univerjs/ui/lib/types/ui-plugin';
import { UniverTableTLPlugin } from '../tl-plugin';

@Injectable()
export class UtTlPluginService<U extends { univer: Univer }> {
  private utdrService: U;

  public init(utdrService: U, containerRef: ElementRef, isViewer: boolean = false): void {
    this.utdrService = utdrService;

    this.registerBasePlugin(containerRef, isViewer);
    this.registerTLPlugin(isViewer);
  }

  private registerBasePlugin(containerRef: ElementRef, isViewer: boolean): void {
    // core plugins
    this.utdrService.univer.registerPlugin(UniverRenderEnginePlugin);
    this.utdrService.univer.registerPlugin(UniverUIPlugin, {
      container: containerRef.nativeElement,
      header: !isViewer,
      toolbar: !isViewer,
      footer: true,
      contextMenu: true,
    } as IUniverUIConfig);

    // doc plugins
    this.utdrService.univer.registerPlugin(UniverDocsPlugin, {
      hasScroll: false,
    });
    this.utdrService.univer.registerPlugin(UniverDocsUIPlugin);

    // sheet plugins
    this.utdrService.univer.registerPlugin(UniverSheetsPlugin, {
      notExecuteFormula: false,
    });
    this.utdrService.univer.registerPlugin(UniverSheetsUIPlugin);

    // formula plugins
    this.utdrService.univer.registerPlugin(UniverSheetsFormulaPlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsFormulaUIPlugin);
    this.utdrService.univer.registerPlugin(UniverFormulaEnginePlugin, {
      notExecuteFormula: false,
    });
  }

  private registerTLPlugin(isViewer: boolean): void {
    this.utdrService.univer.registerPlugin(UniverTableTLPlugin, { type: isViewer ? 'viewer' : 'builder' });
  }

  private registerAdditionalPlugin(): void {
    // sheet feature plugins
    this.utdrService.univer.registerPlugin(UniverSheetsNumfmtPlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsNumfmtUIPlugin);

    // find replace
    // this.utdrService.univer.registerPlugin(UniverFindReplacePlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsFindReplacePlugin);

    // sheets sort
    this.utdrService.univer.registerPlugin(UniverSheetsSortPlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsSortUIPlugin);

    // data validation
    this.utdrService.univer.registerPlugin(UniverDataValidationPlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsDataValidationPlugin);
    this.utdrService.univer.registerPlugin(UniverSheetsDataValidationUIPlugin);

    // filter
    this.utdrService.univer.registerPlugin(UniverSheetsFilterPlugin);

    // sheet condition formatting
    this.utdrService.univer.registerPlugin(UniverSheetsConditionalFormattingUIPlugin);

    // highlight
    this.utdrService.univer.registerPlugin(UniverSheetsCrosshairHighlightPlugin);
  }
}
