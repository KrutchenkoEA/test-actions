/* eslint-disable import/no-extraneous-dependencies */
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { IFormulaDataBase, IFormulaObjectChart } from '../../../../../models';
import { MnemoLoggerService, PopupService } from '../../../../../services';
import { FormulaConfigurationComponent } from '../../../../pure-modules';
import { ChartColorService, ChartPageFormulaService, ChartWrapService } from '../../../chart-module';
import { ChartPageDataService } from '../../services';

/**  @deprecated use MnemoChartPageModule */
@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-chart-formula-list',
  templateUrl: './chart-formula-list.component.html',
  styleUrl: './chart-formula-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartFormulaListComponent {
  private readonly document = inject<Document>(DOCUMENT);
  public chartWrapService = inject(ChartWrapService);
  public cPDataService = inject(ChartPageDataService);
  private readonly cpFormulaService = inject(ChartPageFormulaService);
  private readonly popupService = inject(PopupService);
  private readonly chartColorService = inject(ChartColorService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);

  public getPredictorColor(indexParam: number): string {
    const value = this.cPDataService.activeFormulaAttrMap.get(indexParam);
    const idx = this.cPDataService.getSelectedFormula().findIndex((item) => item.formula === value.formula);
    return this.chartColorService.getColor(idx, 3);
  }

  public selectPredictor(item: IFormulaObjectChart): void {
    const selected = this.cPDataService.getSelectedFormula();
    const { isActive } = item;

    if (selected?.length > this.cPDataService.maxSelectedCount - 1 && !isActive) {
      this.mnemoLoggerService.catchMessage('warning', 'mnemo.ChartPageSelectorComponent.maxCountUnavailable');
      return;
    }
    if (selected?.length === 1 && isActive) {
      this.cpFormulaService.clear();
    }

    item.isActive = !isActive;
    this.cPDataService.drawChart();
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
