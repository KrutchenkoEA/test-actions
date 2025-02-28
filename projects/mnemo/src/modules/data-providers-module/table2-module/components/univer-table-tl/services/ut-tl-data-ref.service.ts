/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { FUniver, IWorkbookData, Nullable, Univer, UniverInstanceType, Workbook, Worksheet } from '@univerjs/core';
import { FSelection, FWorkbook, FWorksheet } from '@univerjs/facade';
import { ISelectionWithStyle } from '@univerjs/sheets';
import { DEFAULT_WORKBOOK_DATA } from '../const';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-ui/facade';
import { IFUniverSheetsMixin } from '@univerjs/sheets/facade';

@Injectable()
export class UtTlDataRefService {
  public selectedRange: ISelectionWithStyle = null;
  public univerAPI: FUniver | null = null;
  public univer: Univer | null = null;
  public workbook?: Workbook;
  public worksheets?: Nullable<Worksheet> | undefined;
  public fWorkbook: FWorkbook;
  public fWorksheets: FWorksheet;

  public _data: IWorkbookData = JSON.parse(JSON.stringify(DEFAULT_WORKBOOK_DATA));

  public get data(): IWorkbookData {
    if (!this.workbook) {
      throw new Error('Workbook is not initialized');
    }

    return this.workbook.save();
  }

  public set data(v: IWorkbookData) {
    if (!v) return;
    this._data = v;
  }

  public init(): void {
    this.workbook = this.univer.createUnit(UniverInstanceType.UNIVER_SHEET, this._data);
    if (this.workbook) {
      this.worksheets = this.workbook.getActiveSheet() as Worksheet;
    }

    this.univerAPI = FUniver.newAPI(this.univer);
    this.fWorkbook = this.univerAPI.getActiveWorkbook();
    this.fWorksheets = this.fWorkbook.getActiveSheet();
  }

  public destroyUniver(): void {
    this.univer?.dispose();
    this.univer = null;
    this.workbook = null;
    this.worksheets = null;
    this.fWorkbook = null;
    this.fWorksheets = null;
    this.univerAPI = null;
  }

  public getSelection(): FSelection {
    return (this.univerAPI as IFUniverSheetsMixin).getActiveWorkbook().getActiveSheet().getSelection();
  }
}
