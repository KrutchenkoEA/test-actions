/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
  IDashboardItem,
  IDataMappingOptions,
  IFormulaData,
  IMnemoSubModel,
  IOmCellObject,
  IViewerTag,
} from '../../../../../models';
import {
  ViewerFormulaService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerRefreshService,
  ViewerTagService,
} from '../../../../pure-modules';
import { ActiveShapesFormulaService } from './active-shapes-formula.service';
import { ActiveShapesOmService } from './active-shapes-om.service';
import { ActiveShapesRealtimeService } from './active-shapes-realtime.service';
import { ActiveShapesTagService } from './active-shapes-tag.service';
import { ActiveShapesService } from './active-shapes.service';

@Injectable()
export class ActiveShapesValueService implements IMnemoSubModel, OnDestroy {
  private readonly activeShapesService = inject(ActiveShapesService);
  private readonly activeShapesRealtimeService = inject(ActiveShapesRealtimeService);
  private readonly activeShapesTagService = inject(ActiveShapesTagService);
  private readonly activeShapesOmService = inject(ActiveShapesOmService);
  private readonly activeShapesFormulaService = inject(ActiveShapesFormulaService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerRefreshService = inject(ViewerRefreshService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);

  public subscriptions: Subscription[] = [];
  public isNeedInit: boolean = true;

  public ngOnDestroy(): void {
    if (this.isNeedInit) {
      this.viewerRefreshService.stopUpdate();
      this.viewerIntervalService.destroy();
    }

    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public getActiveShapesSourceItems(d: IDashboardItem[], isNeedInit: boolean = true): void {
    if (!d) return;
    this.isNeedInit = isNeedInit;

    const tagsNames: Set<string> = new Set();
    const omCellsSet: Set<IOmCellObject> = new Set();
    const formulaCellsSet: Set<IFormulaData> = new Set();

    d.forEach((item) => {
      this.activeShapesService.pointsRealtimeValuesMap.set(item?.id, item?.requestOptions?.points);

      if (!item?.requestOptions || item?.requestOptions?.fixedPoints) {
        this.activeShapesService.fixedPointsRealtimeValuesMap.set(item.id, true);
      } else {
        this.activeShapesService.fixedPointsRealtimeValuesMap.set(item.id, false);
      }

      item.options?.data?.forEach((options: IDataMappingOptions) => {
        options.chartData = [];
        if (options.sourceType === 'tag') {
          tagsNames.add(options.sourceData.tagName as string);
        }
        if (options.sourceType === 'omAttr' && options.sourceData.attrParentGuid && options.sourceData.attrGuid) {
          omCellsSet.add(options.sourceData as IOmCellObject);
          this.viewerOMService
            .getOrCreateOmAttrMap('active-shapes', options.sourceData.attrParentGuid)
            .add(options.sourceData.attrGuid);
        }
        if (options.sourceType === 'formula') {
          formulaCellsSet.add(options.sourceData);
          this.viewerFormulaService.formulaMapActiveShapes.set(options.sourceData.formula, null);
        }
      });
    });

    this.activeShapesRealtimeService.pointsRealtimeValuesMap$.next(this.activeShapesService.pointsRealtimeValuesMap);
    this.activeShapesRealtimeService.fixedPointsRealtimeValuesMap$.next(
      this.activeShapesService.fixedPointsRealtimeValuesMap,
    );

    const nameArr: IViewerTag[] = Array.from(tagsNames)
      .map((t) => {
        return { name: t, roundValue: false, isActiveShape: true };
      })
      .sort();

    this.viewerTagService.isTagsInitActiveShapes$.next(!!nameArr);
    this.viewerTagService.tagsNamesActiveShapes$.next(nameArr);
    this.viewerOMService.omAttrInitActiveShapes$.next(!!omCellsSet.size);
    this.viewerOMService.omSetActiveShapes$.next(omCellsSet);
    this.viewerFormulaService.formulaInitActiveShapes$.next(!!formulaCellsSet.size);
    this.viewerFormulaService.formulaSetActiveShapes$.next(formulaCellsSet);
    this.initSubscribe();
  }

  public initSubscribe(): void {
    if (this.isNeedInit) {
      this.viewerIntervalService.initSubscribe();
    }

    if (this.viewerTagService.isTagsInitActiveShapes$.value) {
      this.activeShapesTagService.initSubscribe();
    }

    if (this.viewerOMService.omAttrInitActiveShapes$.value) {
      this.activeShapesOmService.initSubscribe();
    }

    if (this.viewerFormulaService.formulaInitActiveShapes$.value) {
      this.activeShapesFormulaService.initSubscribe();
    }

    const intervalSub$ = this.viewerIntervalService.intervalTicks$
      .pipe(filter(() => this.activeShapesService.currentTime === 'day'))
      .subscribe(() => {
        this.activeShapesRealtimeService.nextRealtimeData();
      });

    this.subscriptions.push(intervalSub$);
  }
}
