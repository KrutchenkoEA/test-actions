/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { IMnemoUnsubscribed, IUTTableCellData, IUTTableCellDataCustom, IViewerTag } from '../../../../../../models';
import {
  ViewerFormulaService,
  ViewerIntervalService,
  ViewerOMService,
  ViewerRefreshService,
  ViewerTagService,
} from '../../../../../pure-modules';
import { UtTlCellDataService } from '../../../components/univer-table-tl';
import { UtvDataRefService } from '../utv-data-ref.service';
import { UtvFormulaValueService } from './utv-formula-value.service';
import { UtvOmValueService } from './utv-om-value.service';
import { UtvTagValueService } from './utv-tag-value.service';
import { UtvValueApplyService } from './utv-value-apply.service';

@Injectable()
export class UtvValueService implements Partial<IMnemoUnsubscribed> {
  private readonly utvDataRefService = inject(UtvDataRefService);
  private readonly viewerIntervalService = inject(ViewerIntervalService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly utvTagService = inject(UtvTagValueService);
  private readonly utvOmService = inject(UtvOmValueService);
  private readonly utvFormulaService = inject(UtvFormulaValueService);
  private readonly utvValueApplyService = inject(UtvValueApplyService);
  private readonly uttlCellDataService = inject(UtTlCellDataService);
  private readonly viewerRefreshService = inject(ViewerRefreshService);

  public getCellName(): void {
    const tagsNames: Set<string> = new Set();
    const tagsNamesRounded: Set<string> = new Set();
    const omCellsMap: Map<string, IUTTableCellData> = new Map<string, IUTTableCellData>();
    const formulaCellsMap: Map<string, IUTTableCellData> = new Map<string, IUTTableCellData>();

    // eslint-disable-next-line guard-for-in,no-restricted-syntax
    for (const sheetKey in this.utvDataRefService.data.sheets) {
      // eslint-disable-next-line guard-for-in,no-restricted-syntax
      for (const ri in this.utvDataRefService.data.sheets[sheetKey]?.cellData) {
        // eslint-disable-next-line guard-for-in,no-restricted-syntax
        for (const ci in this.utvDataRefService.data.sheets[sheetKey]?.cellData?.[ri]) {
          const cellObject = this.utvDataRefService.data.sheets[sheetKey]?.cellData?.[ri]?.[ci] as IUTTableCellData;
          const tlCellObject = cellObject?.custom as IUTTableCellDataCustom;
          if (tlCellObject) {
            const key = this.uttlCellDataService.getCellId(ri, ci);
            cellObject.custom.ri = Number(ri);
            cellObject.custom.ci = Number(ci);
            cellObject.custom.id = key;
            switch (tlCellObject?.sourceType) {
              case 'tag':
                this.viewerTagService.tagCellsTableMap.set(key, cellObject);
                if (tlCellObject?.roundValue) {
                  tagsNamesRounded.add(tlCellObject.tagName);
                } else {
                  tagsNames.add(tlCellObject.tagName);
                }
                break;
              case 'omAttr':
                omCellsMap.set(key, cellObject);
                // eslint-disable-next-line eqeqeq
                if (tlCellObject?.roundValue == 1) {
                  this.viewerOMService
                    .getOrCreateOmAttrMap('rounded', tlCellObject.attrParentGuid)
                    .add(tlCellObject.attrGuid);
                } else {
                  this.viewerOMService
                    .getOrCreateOmAttrMap('default', tlCellObject.attrParentGuid)
                    .add(tlCellObject.attrGuid);
                }
                break;
              case 'formula':
                formulaCellsMap.set(key, cellObject);
                this.viewerFormulaService.formulaMap.set(tlCellObject.id, null);
                break;
              default:
                break;
            }
          }
        }
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
    this.viewerOMService.omAttrInit$.next(!!omCellsMap.size);
    this.viewerOMService.omMapTable$.next(omCellsMap);
    this.viewerFormulaService.formulaInit$.next(!!formulaCellsMap.size);
    this.viewerFormulaService.formulaCellsTableMap$.next(formulaCellsMap);

    this.initSubs();
  }

  public initSubs(): void {
    this.viewerIntervalService.initSubs();

    if (this.viewerTagService.isTagsInit$.value) {
      this.utvTagService.initSubs();
    }

    if (this.viewerOMService.omAttrInit$.value) {
      this.utvOmService.initSubs();
    }

    if (this.viewerFormulaService.formulaInit$.value) {
      this.utvFormulaService.initSubs();
    }

    this.utvValueApplyService.setBlinkInterval(true);
  }

  public destroySubs(): void {
    this.viewerRefreshService.stopUpdate();
    this.utvValueApplyService.destroySubs();
    this.utvTagService.destroySubs();
    this.utvOmService.destroySubs();
    this.utvFormulaService.destroySubs();
  }
}
