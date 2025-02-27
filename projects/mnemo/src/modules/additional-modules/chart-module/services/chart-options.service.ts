/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { ThemeConfiguratorService } from '@tl-platform/core';
import { takeUntil } from 'rxjs/operators';
import { IVCLayerDataLineViewOptions, IVCLayerViewOptions, IVCViewOpt } from '../../../../models';
import { ViewerService } from '../../../pure-modules';
import {
  MNEMO_AXIS_COLORS_LIST_DARK,
  MNEMO_AXIS_COLORS_LIST_LIGHT,
  MNEMO_GRID_COLORS_LIST_DARK,
  MNEMO_GRID_COLORS_LIST_LIGHT,
} from '../consts';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class ChartOptionsService {
  public themeService = inject(ThemeConfiguratorService);
  public viewerService = inject(ViewerService);
  public isDarkTheme: boolean = true;

  constructor() {
    this.themeService.isDarkTheme.pipe(takeUntil(this.viewerService.viewerMnemoDestroy$)).subscribe((value) => {
      this.isDarkTheme = value;
    });
  }

  public getDefaultChartOptions(): IVCViewOpt {
    return {
      tooltip: true,
      tooltipType: 'fullLine',
      tooltipMarkerType: 'line',
      tooltipMarkerCrossSize: 10,
      tooltipColor: this.isDarkTheme ? '#97a3ba' : '#455168',
      tooltipWidth: 1,
      legend: true,
      zoomType: 'scroll',
      zoomXEnable: true,
      zoomYEnable: false,
      marginLeft: 12,
      marginRight: 12,
      marginBottom: 12,
      marginTop: 12,
      smartScrollEnable: false,
      smartScrollHeight: 42,
      smartScrollColor: '#f0643e',
      interpolateEnable: true,
    };
  }

  public getDefaultLayerOptions(idx: number = 0): IVCLayerViewOptions {
    return {
      axisX: {
        type: 'time',
        position: 'bottom',
        min: null,
        max: null,
        ticks: 10,
        color: this.isDarkTheme ? MNEMO_AXIS_COLORS_LIST_DARK[idx] : MNEMO_AXIS_COLORS_LIST_LIGHT[idx],
        primary: true,
        textColor: this.isDarkTheme ? MNEMO_AXIS_COLORS_LIST_DARK[idx] : MNEMO_AXIS_COLORS_LIST_LIGHT[idx],
      },
      axisY: {
        type: 'number',
        position: 'left',
        min: null,
        max: null,
        ticks: 10,
        color: this.isDarkTheme ? MNEMO_AXIS_COLORS_LIST_DARK[idx] : MNEMO_AXIS_COLORS_LIST_LIGHT[idx],
        primary: false,
        textColor: this.isDarkTheme ? MNEMO_AXIS_COLORS_LIST_DARK[idx] : MNEMO_AXIS_COLORS_LIST_LIGHT[idx],
      },
      gridX: {
        color: this.isDarkTheme ? MNEMO_GRID_COLORS_LIST_DARK[idx] : MNEMO_GRID_COLORS_LIST_LIGHT[idx],
      },
      gridY: {
        color: this.isDarkTheme ? MNEMO_GRID_COLORS_LIST_DARK[idx] : MNEMO_GRID_COLORS_LIST_LIGHT[idx],
      },
    };
  }

  public getDefaultLayerDataOptions(): IVCLayerDataLineViewOptions {
    return {
      lineDynamics: 'curveLinear',
      lineType: 'line',
      lineOpacity: 1,
      lineWidth: 2,

      dataPointType: 'partial',
      dataPointColor: null,

      breakPointType: 'auto',
      breakPoint: true,
      breakPointColor: null,
      breakPointSize: 4,
      breakPointLimit: 50,
      breakPointMarker: 'symbolX',

      endPoint: true,
      endPointSize: 2,
      endPointStrokeSize: 7,

      showValues: false,
      caption: '',
      engUnits: '',
      interpolateEnable: true,
      extendStep: 10,

      reRangeThenLegendClick: true,
      reRangeThenDataChange: true,

      durationAnimation: 2000,
      animation: false,

      lineColor: null,
      areaColor: null,
      areaGradientColors: null,

      separateLayer: false,
    };
  }

  public refreshGrid(color: string, isDarkTheme: boolean): string {
    const colorIndex = (isDarkTheme ? MNEMO_GRID_COLORS_LIST_LIGHT : MNEMO_GRID_COLORS_LIST_DARK).findIndex(
      (c) => c === color
    );

    if (colorIndex === -1) return color;

    return isDarkTheme ? MNEMO_GRID_COLORS_LIST_DARK[colorIndex] : MNEMO_GRID_COLORS_LIST_LIGHT[colorIndex];
  }

  public refreshAxis(color: string, isDarkTheme: boolean): string {
    const colorIndex = (isDarkTheme ? MNEMO_AXIS_COLORS_LIST_LIGHT : MNEMO_AXIS_COLORS_LIST_DARK).findIndex(
      (c) => c === color
    );

    if (colorIndex === -1) return color;

    return isDarkTheme ? MNEMO_AXIS_COLORS_LIST_DARK[colorIndex] : MNEMO_AXIS_COLORS_LIST_LIGHT[colorIndex];
  }

  public refreshTooltip(isDarkTheme: boolean): string {
    return isDarkTheme ? '#97a3ba' : '#455168';
  }
}
