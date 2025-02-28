/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { IDashboardRealTimeData, IDataMappingOptionsViewer } from '../../../../../models';

@Injectable()
export class ActiveShapesRawExtractorService {
  public extractRawData(
    id: string,
    raw: IDashboardRealTimeData['raw'],
    orderMap: Map<string, number>
  ): IDataMappingOptionsViewer[] {
    const rawData = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const [, value] of raw.entries()) {
      if (value?.parentChartId === id) {
        rawData.push(value);
      }
    }
    if (orderMap?.size) {
      rawData.sort((a: { name: string }, b: { name: string }) => {
        return orderMap.get(a?.name) >= orderMap.get(b?.name) ? 1 : -1;
      });
    }

    return rawData;
  }
}
