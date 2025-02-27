/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import {
  COLOR_PALETTE_1,
  COLOR_PALETTE_2,
  COLOR_PALETTE_3,
  COLOR_PALETTE_4,
  COLOR_PALETTE_5,
  COLOR_PALETTE_6,
} from '../../../../consts';

@Injectable()
export class MnemoChartColorService {
  public getColor(idx: number, preset: 1 | 2 | 3 | 4 | 5 | 6 = 1): string {
    if ((preset === 1 && idx > 29) || idx > 12) {
      return this.getRandomColor();
    }

    switch (preset) {
      case 1:
        return COLOR_PALETTE_1[idx];
      case 2:
        return COLOR_PALETTE_2[idx];
      case 3:
        return COLOR_PALETTE_3[idx];
      case 4:
        return COLOR_PALETTE_4[idx];
      case 5:
        return COLOR_PALETTE_5[idx];
      case 6:
        return COLOR_PALETTE_6[idx];
      default:
        return COLOR_PALETTE_1[idx];
    }
  }

  private getRandomColor(): string {
    const letters = '0123456789ABCDEF';
    let color = '#';
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
}
