/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { uuidGenerate } from '@tl-platform/core';
import { tluiChartLineMockTime2 } from '@tl-platform/ui';
import { DataItemTypeEnum, IDashboardItem, IDataMappingOptions, ViewElementTypeEnum } from '../../../../../models';

@Injectable()
export class ActiveShapesDataCreatorService {
  public createDashboardObject(viewType: ViewElementTypeEnum, dataType: DataItemTypeEnum): IDashboardItem {
    return {
      x: 0,
      y: 0,
      cols: 0,
      rows: 0,
      id: uuidGenerate(),
      name: '',
      viewElementType: viewType,
      options: {
        exampleView: false,
        type: viewType,
        data: [this.createDataFromSource(dataType)],
        view: null,
      },
    };
  }

  public createDataFromSource(dataType: DataItemTypeEnum): IDataMappingOptions {
    return {
      name: '',
      sourceData: null,
      sourceType: null,
      type: dataType,
      color: '#f0643e',
      chartData: tluiChartLineMockTime2.map((t) => {
        return [new Date(t[0]), t[1]];
      }),
    };
  }
}
