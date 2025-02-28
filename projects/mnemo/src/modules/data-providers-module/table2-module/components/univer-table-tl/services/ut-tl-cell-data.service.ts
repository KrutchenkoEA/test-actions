/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { ICellData, IStyleData } from '@univerjs/core';
import { FRange } from '@univerjs/facade';
import { UtTlDataRefService } from './ut-tl-data-ref.service';

@Injectable()
export class UtTlCellDataService {
  public uttlCellDataService: UtTlDataRefService;

  public init(utTlDataRefService: UtTlDataRefService): void {
    this.uttlCellDataService = utTlDataRefService;
  }

  public getFRange(row: number, col: number, height?: number, width?: number): FRange {
    return this.uttlCellDataService?.fWorksheets?.getRange(row, col, height, width);
  }

  public getCellData(row: number, col: number, height?: number, width?: number): ICellData {
    return this.getFRange(row, col, height, width)?.getCellData();
  }

  public getCellStyle(row: number, col: number, height?: number, width?: number): IStyleData {
    return this.getFRange(row, col, height, width)?.getCellStyleData();
  }

  public setCellData(
    row: number,
    col: number,
    value: string | number | boolean,
    height?: number,
    width?: number
  ): void {
    if (!value) return;
    this.getFRange(row, col, height, width)?.setValue(value);
  }

  public getCellId(row: number | string, col: number | string): string {
    return `${row}-${col}`;
  }
}
