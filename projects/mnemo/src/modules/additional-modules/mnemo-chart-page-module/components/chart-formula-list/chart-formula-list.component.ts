/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { MNEMO_CHART_DEFAULT_VIEW_OPTIONS } from '../../../../../consts';
import { IFormulaDataBase, IFormulaObjectChart } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import { FormulaConfigurationComponent } from '../../../../pure-modules';
import {
  MnemoChartColorService,
  MnemoChartFormulaService,
  MnemoChartWrapService,
} from '../../../mnemo-chart-module/services';
import { MnemoChartPageDataService } from '../../services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-formula-list-2',
  templateUrl: './chart-formula-list.component.html',
  styleUrl: './chart-formula-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MnemoChartFormulaListComponent {
  private readonly document = inject<Document>(DOCUMENT);
  public mnemoChartWrapService = inject(MnemoChartWrapService);
  public mnemoChartPageDataService = inject(MnemoChartPageDataService);
  private readonly mnemoChartFormulaService = inject(MnemoChartFormulaService);
  private readonly mnemoChartColorService = inject(MnemoChartColorService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  private readonly popupService = inject(PopupService);

  public getPredictorColor(indexParam: number): string {
    const value = this.mnemoChartPageDataService.activeFormulaAttrMap.get(indexParam);
    const idx = this.mnemoChartPageDataService.getSelectedFormula().findIndex((item) => item.formula === value.formula);
    return this.mnemoChartColorService.getColor(idx, 3);
  }

  public selectPredictor(item: IFormulaObjectChart): void {
    const selected = this.mnemoChartPageDataService.getSelectedFormula();
    const { isActive } = item;
    const maxSelected =
      this.mnemoChartPageDataService.viewForm?.value?.maxSelectedTrend ??
      MNEMO_CHART_DEFAULT_VIEW_OPTIONS.maxSelectedTrend;

    if (selected?.length > maxSelected - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.mnemoChartFormulaService.clear();
    }

    item.isActive = !isActive;
    this.mnemoChartPageDataService.drawChart();
  }

  public openSettingPopup(e: MouseEvent, item: IFormulaObjectChart): void {
    e.preventDefault();
    e.stopPropagation();
    this.popupService
      .open(
        FormulaConfigurationComponent,
        {
          data: {
            formula: item.formula,
            formulaAggregation: item.formulaAggregation,
            formulaInterval: item.formulaInterval,
            formulaDimension: item.formulaDimension,
            formulaWeighting: item.formulaWeighting,
            formulaMode: item.formulaMode,
            unitName: item.unitName,
            formulaValue: item.formulaValue,
          } as IFormulaDataBase,
        },
        {
          width: this.document.defaultView.innerWidth * 0.8,
          height: this.document.defaultView.innerHeight * 0.8,
          positions: [
            {
              originX: 'center',
              originY: 'center',
              overlayX: 'center',
              overlayY: 'center',
            },
          ],
        },
      )
      .popupRef.afterClosed()
      .pipe(takeUntilDestroyed(this))
      .subscribe((result: IFormulaDataBase) => {
        if (result) {
          item.formula = result.formula;
          item.formulaAggregation = result.formulaAggregation;
          item.formulaInterval = result.formulaInterval;
          item.formulaDimension = result.formulaDimension;
          item.formulaWeighting = result.formulaWeighting;
          item.formulaMode = result.formulaMode;
          item.unitName = result.unitName;
          item.formulaValue = result.formulaValue;
        }
      });
  }
}
