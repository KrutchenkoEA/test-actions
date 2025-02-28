/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unsafe-optional-chaining */
import { Injectable } from '@angular/core';
import { TluiChartLineDataSimple, TluiLCBarData, TluiLCStackedBarData } from '@tl-platform/ui';
import { COLOR_PALETTE_1 } from '../../../../../consts';
import {
  ComboChartComboKeyType,
  IComboChartComboData,
  IDashboardRealTimeData,
  IDataMappingOptionsViewer,
  IOmCellObjectBase,
} from '../../../../../models';

@Injectable()
export class ActiveShapesShapesSetsChartService {
  public createData(): IDataMappingOptionsViewer {
    return {
      name: '',
      sourceType: null,
      sourceData: null,
      palette: [],
      paletteRaw: [],
      type: null,
      chartData: [],
      chartDataRaw: [],
      caption: [],
      captionRaw: [],
      opacity: 1,
      opacityArr: [],
      opacityArrRaw: [],
      barBorderColors: [],
      barBorderColorsRaw: [],
      dataNameTypeRecord: {},
      dataNameGuidRecord: {},
    };
  }

  public createComboData(keys: string[]): IComboChartComboData {
    const comboData = {};
    keys?.forEach((key: string) => {
      comboData[key] = this.createData();
    });

    return <IComboChartComboData>comboData;
  }

  public combineData(data: IDataMappingOptionsViewer, stackData: boolean = false): void {
    if (stackData) {
      data.chartDataCommon = this.getStackDataFromArray([...data?.chartData, ...data?.chartDataRaw]);
    } else {
      data.chartDataCommon = [...data?.chartData, ...data?.chartDataRaw];
    }
    data.barBorderColorsCommon = [...data?.barBorderColors, ...data?.barBorderColorsRaw];
    data.opacityArrCommon = [...data?.opacityArr, ...data?.opacityArrRaw];
    data.captionCommon = [...data?.caption, ...data?.captionRaw];
    data.paletteCommon = [...data?.palette, ...data?.paletteRaw];
  }

  public setData(data: IDataMappingOptionsViewer | null, item: IDataMappingOptionsViewer): IDataMappingOptionsViewer {
    data.chartData.push(item.chartData);
    data.caption.push(item.name);
    data.palette.push(item.color);
    if (item.secondColor) {
      data.barBorderColors.push(item.secondColor);
    }
    if (item.opacity) {
      data.opacityArr.push(item.opacity);
    }
    data.dataNameTypeRecord[item.name] = item.sourceType;
    if (item?.sourceData?.attrGuid) {
      data.dataNameGuidRecord[item.name] = item?.sourceData?.attrGuid;
    }

    return data;
  }

  public setDataRaw(
    data: IDataMappingOptionsViewer | null,
    item: IDataMappingOptionsViewer,
    counter: number = 0,
    fixedPointsRealtimeData: boolean = true,
    pointsRealtimeData: null | number = null
  ): IDataMappingOptionsViewer {
    if (fixedPointsRealtimeData) {
      const currentLength = item.chartData?.length;
      const requiredLength = pointsRealtimeData > 0 ? pointsRealtimeData : currentLength;
      data.chartDataRaw.push(item.chartData.slice(-requiredLength));
    } else {
      data.chartDataRaw.push(item.chartData);
    }
    data.captionRaw.push(item.name);
    data.paletteRaw.push(item.color);
    if (item.secondColor) {
      data.barBorderColorsRaw.push(item.secondColor);
    }
    if (item.opacity) {
      data.opacityArrRaw.push(item.opacity);
    }
    if (!data?.paletteRaw?.length) {
      data.paletteRaw = COLOR_PALETTE_1;
    }
    if (item?.color && data?.paletteRaw?.[counter]) {
      data.paletteRaw[counter] = item.color;
    }

    return data;
  }

  public setDataRealtime<U extends { data: IDataMappingOptionsViewer[] }>(
    existData: U,
    realTimeData: IDashboardRealTimeData,
    fixedPointsRealtimeData: boolean = true,
    pointsRealtimeData: null | number = null
  ): void {
    existData?.data?.forEach((d) => {
      if (d.sourceType === 'tag') {
        const data = realTimeData.tag.get(d.name);
        this.setDataToItem(d, data, data?.length, fixedPointsRealtimeData, pointsRealtimeData);
      }
      if (d.sourceType === 'omAttr') {
        const data = realTimeData.omAttr.get((d.sourceData as IOmCellObjectBase).attrGuid);
        this.setDataToItem(d, data, data?.length, fixedPointsRealtimeData, pointsRealtimeData);
      }
      if (d.sourceType === 'formula') {
        d.chartData = [];
      }
    });
  }

  public setComboDataRealtime<U extends Partial<IComboChartComboData>>(
    comboData: U,
    realTimeData: IDashboardRealTimeData,
    fixedPointsRealtimeData: boolean = true,
    key: ComboChartComboKeyType = 'comboBar',
    pointsRealtimeData: null | number = null
  ): void {
    comboData?.[key]?.caption?.forEach((c) => {
      const mapperName = comboData?.[key]?.dataNameTypeRecord[c] ?? 'tag';
      if (mapperName === 'tag') {
        const data = realTimeData.tag.get(c);
        this.setDataToItem(comboData?.[key], data, data?.length, fixedPointsRealtimeData, pointsRealtimeData);
      }
      if (mapperName === 'omAttr') {
        const attrGuid = comboData[key]?.dataNameGuidRecord[c];
        const data = realTimeData.omAttr.get(attrGuid);
        this.setDataToItem(comboData?.[key], data, data?.length, fixedPointsRealtimeData, pointsRealtimeData);
      }
      if (mapperName === 'formula') {
        comboData?.[key].chartData.push([]);
      }
    });
  }

  public refreshField<U extends { comboData }>(existData: U, key: string): void {
    existData.comboData[key].chartData = [];
    existData.comboData[key].chartDataRaw = [];
    existData.comboData[key].captionRaw = [];
    existData.comboData[key].barBorderColorsRaw = [];
    existData.comboData[key].opacityArrRaw = [];
    existData.comboData[key].paletteRaw = [];
    existData.comboData[key].chartDataCommon = [];
    existData.comboData[key].chartDataCommon = [];
    existData.comboData[key].captionCommon = [];
    existData.comboData[key].barBorderColorsCommon = [];
    existData.comboData[key].opacityArrCommon = [];
    existData.comboData[key].paletteCommon = [];
  }

  /**  @deprecated todo remove. Используется для deprecated DashboardMultiLineChartComponent */
  public getStackDataFromArray(data: TluiLCBarData[][]): TluiLCStackedBarData[] {
    const stackedDataMap: Map<number, TluiLCStackedBarData> = new Map();
    data.forEach((t) => {
      t?.forEach((v, i) => {
        const d = stackedDataMap.get(i);

        if (d) {
          d[1].push(v[1]);
        } else {
          stackedDataMap.set(i, [v[0], [v[1]], v[2] ?? i + 1]);
        }
      });
    });
    return Array.from(stackedDataMap.values());
  }

  private setDataToItem(
    item: IDataMappingOptionsViewer,
    data: TluiChartLineDataSimple[],
    dataLength: number,
    fixedPointsRealtimeData: boolean = true,
    pointsRealtimeData: null | number = null
  ): void {
    if (!dataLength) {
      item.chartData = [];
    } else if (fixedPointsRealtimeData) {
      const chartLength = item.chartData?.length;
      const currentLength = chartLength > 0 ? chartLength : dataLength;
      const requiredLength = pointsRealtimeData > 0 ? pointsRealtimeData : currentLength;
      item.chartData = data.slice(0, requiredLength);
    } else {
      item.chartData = data;
    }
  }
}
