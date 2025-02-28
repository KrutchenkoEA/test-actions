/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { FUniver } from '@univerjs/core';
import { IFUniverSheetsUIMixin } from '@univerjs/sheets-ui/lib/types/facade';

@Injectable()
export class UtTlThemeService<U extends { univerAPI: FUniver }> {
  private utDataRefService: U;

  public init(utDataRefService: U): void {
    this.utDataRefService = utDataRefService;
  }

  public setDark(): void {
    (this.utDataRefService?.univerAPI as IFUniverSheetsUIMixin)?.customizeRowHeader({
      headerStyle: {
        backgroundColor: '#2d3443',
        fontColor: '#ffffff',
        borderColor: '#29303d',
      },
    });
    (this.utDataRefService?.univerAPI as IFUniverSheetsUIMixin)?.customizeColumnHeader({
      headerStyle: {
        backgroundColor: '#2d3443',
        fontColor: '#ffffff',
        borderColor: '#29303d',
      },
    });
  }

  public setLight(): void {
    (this.utDataRefService?.univerAPI as IFUniverSheetsUIMixin)?.customizeRowHeader({
      headerStyle: {
        backgroundColor: '#e0e4eb',
        fontColor: '#212631',
        borderColor: '#eaecf1',
      },
    });
    (this.utDataRefService?.univerAPI as IFUniverSheetsUIMixin)?.customizeColumnHeader({
      headerStyle: {
        backgroundColor: '#e0e4eb',
        fontColor: '#212631',
        borderColor: '#eaecf1',
      },
    });
  }
}
