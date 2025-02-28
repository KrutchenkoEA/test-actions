/* eslint-disable import/no-extraneous-dependencies */
import { ElementRef, Injectable, inject } from '@angular/core';
import { mxCell, mxGraph, mxGraphModel } from 'mxgraph';
import { IDataMappingOptions, IFormulaData, IOmCellObject, IViewerTag } from '../../../../../../models';
import {
  ViewerActiveShapesService,
  ViewerFormulaService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerRefreshService,
  ViewerService,
  ViewerTagService,
} from '../../../../../pure-modules';
import { MnemoAbstractClass } from '../mnemo-abstract-class';
import { MnemoFormulaService } from './mnemo-formula.service';
import { MnemoOmService } from './mnemo-om.service';
import { MnemoTagService } from './mnemo-tag.service';
import { MnemoValueApplyService } from './mnemo-value-apply.service';

@Injectable()
export class MnemoValueService implements MnemoAbstractClass {
  viewerService = inject(ViewerService);
  private readonly mnemoValueApplyService = inject(MnemoValueApplyService);
  private readonly mnemoTagService = inject(MnemoTagService);
  private readonly mnemoOmService = inject(MnemoOmService);
  private readonly mnemoFormulaService = inject(MnemoFormulaService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerRefreshService = inject(ViewerRefreshService);
  private readonly viewerActiveShapesService = inject(ViewerActiveShapesService);

  public graph: mxGraph;

  public init(graph: mxGraph, graphContainer: ElementRef<HTMLElement>): void {
    this.graph = graph;

    this.mnemoValueApplyService.init(this.graph);
    this.mnemoTagService.init(this.graph, graphContainer);
    this.mnemoOmService.init(this.graph);
    this.mnemoFormulaService.init(this.graph);
  }

  public getCellSourceItems(): void {
    const model: mxGraphModel = this.graph.getModel();
    let cell: mxCell;
    const { cells } = model;
    const tagsNames: Set<string> = new Set();
    const tagsNamesRounded: Set<string> = new Set();
    const omCellsSet: Set<mxCell> = new Set();
    const formulaCellsSet: Set<mxCell> = new Set();
    const activeShapesSet: Set<mxCell> = new Set();
    const tagsNamesAs: Set<string> = new Set();
    const omCellsSetAs: Set<IOmCellObject> = new Set();
    const formulaCellsSetAs: Set<IFormulaData> = new Set();

    // eslint-disable-next-line no-restricted-syntax, guard-for-in
    for (const key in cells) {
      cell = cells[key];
      if (this.viewerService.disableEvents && cell.loadEvents) {
        this.viewerService.disableEvents = false;
      }
      if (cell.isEdge()) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (cell.cellType === 'active-element' && cell?.style?.indexOf('shape=customShape') !== -1) {
        activeShapesSet.add(cell);
        cell.activeShape?.options?.data?.forEach((item: IDataMappingOptions) => {
          item.chartData = [];
          if (item.sourceType === 'tag') {
            tagsNamesAs.add(item.sourceData.tagName as string);
          }
          if (item.sourceType === 'omAttr' && item.sourceData.attrParentGuid && item.sourceData.attrGuid) {
            omCellsSetAs.add(item.sourceData as IOmCellObject);
          }
          if (item.sourceType === 'formula') {
            formulaCellsSetAs.add(item.sourceData);
          }
        });
      } else if (
        (cell.sourceType === 'tag' || !cell.sourceType || cell.sourceType === 'om') &&
        cell?.tagName?.length > 0
      ) {
        this.viewerTagService.tagCellsMnemoSet.add(cell);
        // eslint-disable-next-line eqeqeq
        if (cell?.roundValue == 1) {
          tagsNamesRounded.add(cell.tagName);
        } else {
          tagsNames.add(cell.tagName);
        }
      } else if (cell.sourceType === 'omAttr' && cell.attrParentGuid && cell.attrGuid) {
        omCellsSet.add(cell);

        // eslint-disable-next-line eqeqeq
        if (cell?.roundValue == 1) {
          this.viewerOMService.getOrCreateOmAttrMap('rounded', cell.attrParentGuid).add(cell.attrGuid);
        } else {
          this.viewerOMService.getOrCreateOmAttrMap('default', cell.attrParentGuid).add(cell.attrGuid);
        }
      } else if (cell.sourceType === 'formula' || cell.formula?.length) {
        formulaCellsSet.add(cell);
        this.viewerFormulaService.formulaMap.set(cell.getId(), null);
      }
    }

    const nameArr: IViewerTag[] = [
      ...Array.from(tagsNames).map((t) => {
        return { name: t, roundValue: false };
      }),
      ...Array.from(tagsNamesRounded).map((t) => {
        return { name: t, roundValue: true };
      }),
    ].sort();
    this.viewerTagService.isTagsInit$.next(!!nameArr?.length);
    this.viewerTagService.tagsNames$.next(nameArr);
    this.viewerOMService.omAttrInit$.next(!!omCellsSet.size);
    this.viewerOMService.omSetMnemo$.next(omCellsSet);
    this.viewerFormulaService.formulaInit$.next(!!formulaCellsSet.size);
    this.viewerFormulaService.formulaSetMnemo$.next(formulaCellsSet);
    this.viewerActiveShapesService.activeShapesInit$.next(!!activeShapesSet.size);
    this.viewerActiveShapesService.activeShapesSet$.next(activeShapesSet);

    const nameArrAs: IViewerTag[] = Array.from(tagsNamesAs)
      .map((t) => {
        return { name: t, roundValue: false, isActiveShape: true };
      })
      .sort();

    this.viewerTagService.isTagsInitActiveShapes$.next(!!nameArrAs?.length);
    this.viewerTagService.tagsNamesActiveShapes$.next(nameArrAs);
    this.viewerOMService.omAttrInitActiveShapes$.next(!!omCellsSetAs.size);
    this.viewerOMService.omSetActiveShapes$.next(omCellsSetAs);
    this.viewerFormulaService.formulaInitActiveShapes$.next(!!formulaCellsSetAs.size);
    this.viewerFormulaService.formulaSetActiveShapes$.next(formulaCellsSetAs);

    this.initSubscribe();
  }

  public initSubscribe(): void {
    this.viewerIntervalService.initSubscribe();

    if (this.viewerTagService.isTagsInit$.value) {
      this.mnemoTagService.initSubscribe();
    }

    if (this.viewerOMService.omAttrInit$.value) {
      this.mnemoOmService.initSubscribe();
    }

    if (this.viewerFormulaService.formulaInit$.value) {
      this.mnemoFormulaService.initSubscribe();
    }

    this.mnemoValueApplyService.setBlinkInterval(true);
  }

  public destroy(): void {
    this.viewerRefreshService.stopUpdate();
    this.mnemoValueApplyService.destroy();
    this.mnemoTagService.destroy();
    this.mnemoOmService.destroy();
    this.mnemoFormulaService.destroy();
    this.viewerIntervalService.destroy();
  }
}
