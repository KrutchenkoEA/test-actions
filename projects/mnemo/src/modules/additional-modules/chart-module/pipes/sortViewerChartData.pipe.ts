/* eslint-disable import/no-extraneous-dependencies */
import { Pipe, PipeTransform } from '@angular/core';
import { IVCLayerDataLine } from '../../../../models';

/**  @deprecated use MnemoChartModule */
@Pipe({
  name: 'sortViewerChartData',
})
export class SortViewerChartDataPipe implements PipeTransform {
  public transform(value: IVCLayerDataLine[] | null): IVCLayerDataLine[] {
    if (value.length !== 0 || value !== null || value !== undefined) {
      return value.sort((a, b) => {
        if (a.layerDataViewOptions.caption > b.layerDataViewOptions.caption) return 1;
        if (a.layerDataViewOptions.caption <= b.layerDataViewOptions.caption) return -1;
        return 0;
      });
    }
    return [];
  }
}
