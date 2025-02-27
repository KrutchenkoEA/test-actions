/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed, uuidGenerate } from '@tl-platform/core';
import { IOmObjectChart, ISourceModalResult } from '../../../../models';
import { PopupService } from '../../../../services';
import {
  FormulaConfigurationComponent,
  OmTagModalComponent,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../../pure-modules';
import { MnemoChartUserPointsComponent } from '../components';
import { MnemoChartPageDataService } from './mnemo-chart-page-data.service';

@DecorateUntilDestroy()
@Injectable()
export class MnemoChartPageAddService {
  private readonly mnemoChartPageDataService = inject(MnemoChartPageDataService);
  private readonly popupService = inject(PopupService);
  private readonly viewerService = inject(ViewerService);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);

  public text = uuidGenerate();

  public addTag(): void {
    this.popupService
      .open(OmTagModalComponent, { baseUrl: this.viewerService.baseUrl, multipleSelect: false })
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((res: ISourceModalResult) => {
        const tag = res?.tags?.[0];
        if (tag?.tagName) {
          const selectedTags = [
            ...this.mnemoChartPageDataService.getSelectedTags(),
            { tagName: tag?.tagName, index: this.viewerTagService.tagsNames$.value.length },
          ];
          const tags: { name: string; roundValue: boolean }[] = this.viewerTagService.tagsNames$.value;
          this.viewerTagService.tagsNames$.next([...tags, { name: tag.tagName, roundValue: false }]);
          this.mnemoChartPageDataService.reSelectTags$.next(selectedTags);
        }
      });
  }

  public addOmAttribute(): void {
    this.popupService
      .open(OmTagModalComponent, {
        baseUrl: this.viewerService.baseUrl,
        multipleSelect: false,
        allowMethods: ['objectModel'],
        currentMethod: 'objectModel',
        filterAttributeType: 'Все',
      })
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((res: ISourceModalResult) => {
        const attr = res?.attributes?.[0];
        if (attr?.attrGuid && attr.attrParentGuid) {
          const newAttr = Object.assign(attr, {
            isActive: true,
            name: `${attr.attrParentPath} | ${attr.attrGuid}`,
            value: null,
            index: this.viewerOMService.omObjectMap$.value.size,
          });

          const selectedAttr: IOmObjectChart[] = [...this.mnemoChartPageDataService.getSelectedOmAttr(), newAttr];
          const dataMap = this.viewerOMService.omObjectMap$.value;
          dataMap.set(attr.attrGuid, newAttr);

          this.viewerOMService.omObjectMap$.next(dataMap);
          this.mnemoChartPageDataService.reSelectOmAttr$.next(selectedAttr);
        }
      });
  }

  public addFormula(): void {
    this.popupService
      .open(FormulaConfigurationComponent, {})
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((result) => {
        if (result) {
          /* empty */
        }
      });
  }

  public addUserPoints(): void {
    this.popupService
      .open(MnemoChartUserPointsComponent, {})
      .popupRef.afterClosed()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .subscribe((res: unknown) => {
        // if (!!res) {
        //   this.activeTagMap.set(this.tagsNames.length, { name: res.tagName, isActive: false, isUser: true });
        //   this.tagsNames.push({ tagName: res.tagName, isUser: true });
        //   this.chartService.tagDataMapChartPage.set(res.tagName, res.data);
        // }
      });
  }
}
