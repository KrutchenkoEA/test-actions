/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { MNEMO_CHARTS_COLORS_LIST, MNEMO_CHARTS_COLORS_LIST_SET_2, MNEMO_CHARTS_COLORS_LIST_SET_3 } from '../consts';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartColorService {
  public getColor(idx: number, preset: 1 | 2 | 3 = 1): string {
    if (idx > 15) {
      return this.getRandomColor();
    }

    switch (preset) {
      case 1:
        return MNEMO_CHARTS_COLORS_LIST[idx];
      case 2:
        return MNEMO_CHARTS_COLORS_LIST_SET_2[idx];
      case 3:
        return MNEMO_CHARTS_COLORS_LIST_SET_3[idx];
      default:
        return MNEMO_CHARTS_COLORS_LIST[idx];
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
