/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { TLUI_LC_COLORS_LIST } from '@tl-platform/ui';
import { BehaviorSubject } from 'rxjs';
import { IDashboardItem } from '../../../../../models';

@Injectable()
export class ActiveShapesService {
  public defaultPalette: string[] = TLUI_LC_COLORS_LIST;

  public isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentTime: 'day' | 'period' = 'day';
  public fixedPointsRealtimeValuesMap: Map<string, boolean> = new Map<string, boolean>();
  public pointsRealtimeValuesMap: Map<string, number> = new Map<string, number>();

  public getDefaultColor(index: number): string {
    if (index >= this.defaultPalette.length) {
      return this.getDefaultColor(index - this.defaultPalette.length);
    }
    return this.defaultPalette[index];
  }

  public getJsonFile(data: IDashboardItem[], name: string): File {
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: 'application/json' });
    return new File([blob], name);
  }
}
