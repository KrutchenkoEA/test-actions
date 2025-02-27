/* eslint-disable import/no-extraneous-dependencies */
import { Direction } from '@angular/cdk/bidi';
import { inject, Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IFormulaObjectChart, IOmObjectChart, ITagObjectChart } from '../../../../models';
import { ChartWrapService } from '../../chart-module';

/**  @deprecated use MnemoChartPageModule */
@Injectable()
export class ChartPageDataService {
  public chartWrapService = inject(ChartWrapService);

  public activeTagMap: Map<number, ITagObjectChart> = new Map();
  public activeOmAttrMap: Map<number, IOmObjectChart> = new Map();
  public activeFormulaAttrMap: Map<number, IFormulaObjectChart> = new Map();

  public maxSelectedCount: number = 10;

  public currentDirection: Direction = 'ltr';
  public date: { start: Date; end: Date } = {
    start: new Date(new Date().setHours(new Date().getHours() - 8)),
    end: new Date(),
  };

  public pointsCount: number = 0;

  public clearSelection$: Subject<null> = new Subject<null>();

  public reSelectTags$: Subject<{ tagName: string }[]> = new Subject<{ tagName: string }[]>();
  public reSelectOmAttr$: Subject<IOmObjectChart[]> = new Subject<IOmObjectChart[]>();
  public reSelectFormulas$: Subject<{ name: string }[]> = new Subject<{ name: string }[]>();

  public getSelectedTags(): ITagObjectChart[] {
    const selectedArr: ITagObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeTagMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public getSelectedOmAttr(): IOmObjectChart[] {
    const selectedArr: IOmObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeOmAttrMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public getSelectedFormula(): IFormulaObjectChart[] {
    const selectedArr: IFormulaObjectChart[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for (const val of this.activeFormulaAttrMap.values()) {
      if (val.isActive) {
        selectedArr.push(val);
      }
    }
    return selectedArr;
  }

  public drawChart(isNeedLoader = true): void {
    if (isNeedLoader) {
      this.chartWrapService.chartWrapLoading$.next(true);
    }

    this.chartWrapService.chartPageData$.next({
      tags: this.getSelectedTags(),
      omAttributes: this.getSelectedOmAttr(),
      formulas: this.getSelectedFormula(),
      pointsCount: this.pointsCount,
      date: this.date,
      isExistData: false,
    });
  }
}
