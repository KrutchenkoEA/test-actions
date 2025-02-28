/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChartNameType, IChartDrawOpt, LineType, LineTypesType, SelectedTagType } from '../../../../models';

@Injectable()
export class ViewerPopupChartService {
  public drawOptDefault: IChartDrawOpt = {
    lineType: 'curveBasis',
    zoomXEnable: true,
    zoomYEnable: false,
    zoomType: 'scroll',
    smartScrollEnable: false,
    interpolateEnable: true,
    tooltipType: 'fullLine',
    markerType: 'line',
  };

  public lines: LineType[] = [
    'curveBasis',
    'curveLinear',
    'curveMonotoneX',
    'curveMonotoneY',
    'curveNatural',
    'curveStep',
    'curveStepAfter',
    'curveStepBefore',
  ];

  public drawOpt1: IChartDrawOpt = { ...this.drawOptDefault };
  public drawOpt2: IChartDrawOpt = { ...this.drawOptDefault };
  public drawOpt3: IChartDrawOpt = { ...this.drawOptDefault };

  public chartTags1$: BehaviorSubject<SelectedTagType> = new BehaviorSubject<SelectedTagType>([]);
  public chartTags2$: BehaviorSubject<SelectedTagType> = new BehaviorSubject<SelectedTagType>([]);
  public chartTags3$: BehaviorSubject<SelectedTagType> = new BehaviorSubject<SelectedTagType>([]);

  public lineType1$: BehaviorSubject<LineType> = new BehaviorSubject<LineType>(null);
  public lineType2$: BehaviorSubject<LineType> = new BehaviorSubject<LineType>(null);
  public lineType3$: BehaviorSubject<LineType> = new BehaviorSubject<LineType>(null);

  public pointsCount$: BehaviorSubject<number> = new BehaviorSubject<number>(null);
  public chartForClear$: Subject<ChartNameType | null> = new Subject<ChartNameType | null>();
  public chartNames: ChartNameType[] = ['chartTags1$', 'chartTags2$', 'chartTags3$'];
  public lineTypes: LineTypesType[] = ['lineType1$', 'lineType2$', 'lineType3$'];

  // todo refactor
  public showChart(tagName: string): void {
    const tags: string[] = this.chartTags1$?.value ?? [];
    if (tags.find((tag) => tag === tagName)) {
      return;
    }
    tags.push(tagName);
    this.chartTags1$.next(tags);
  }

  public cleanChartData(): void {
    this.chartTags1$.next(null);
    this.chartTags2$.next(null);
    this.chartTags3$.next(null);

    this.drawOpt1 = { ...this.drawOptDefault };
    this.drawOpt2 = { ...this.drawOptDefault };
    this.drawOpt3 = { ...this.drawOptDefault };
  }
}
