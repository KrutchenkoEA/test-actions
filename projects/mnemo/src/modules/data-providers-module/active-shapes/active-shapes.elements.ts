import { DataItemTypeEnum, IActiveShapesElement, ViewElementTypeEnum } from '../../../models';
import { ActiveShapeComboChartComponent } from './components/combo-chart/combo-chart.component';
import { ActiveShapeComboChartOptionsComponent } from './components/combo-chart/options/combo-chart-options.component';
import { ActiveShapePieChartOptionsComponent } from './components/pie-chart/options/pie-chart-options.component';
import { ActiveShapePieChartComponent } from './components/pie-chart/pie-chart.component';
import { ActiveShapeTableOptionsComponent } from './components/table/options/table-options.component';
import { ActiveShapeTableComponent } from './components/table/table.component';
import { ActiveShapeMultiLineChartComponent } from './components/multi-line-chart/multi-line-chart.component';
import { ActiveShapeMultiLineChartOptionsComponent } from './components/multi-line-chart/options/multi-line-chart-options.component';
import { ActiveShapeProgressChartComponent } from './components/progress-chart/progress-chart.component';
import { ActiveShapeSingleValueOptionsComponent } from './components/single-value/options/single-value-options.component';
import { ActiveShapeSingleValueComponent } from './components/single-value/single-value.component';
import { ActiveShapeVerticalProgressBarComponent } from './components/vertical-progress-bar/vertical-progress-bar.component';

export const ACTIVE_SHAPES: IActiveShapesElement[] = [
  // region мнемосхемы
  {
    name: 'verticalProgressBar',
    icon: 'progress.svg',
    type: ViewElementTypeEnum.VerticalProgressBar,
    component: ActiveShapeVerticalProgressBarComponent,
    isMnemoItem: true,
    isDashboardItem: false,
  },
  {
    name: 'barChart',
    icon: 'bar-chart.svg',
    type: ViewElementTypeEnum.ComboChart,
    dataItemType: DataItemTypeEnum.Bar,
    component: ActiveShapeComboChartComponent,
    optionsComponent: ActiveShapeComboChartOptionsComponent,
    isMnemoItem: true,
    isDashboardItem: false,
  },
  // endregion

  // region общие
  {
    name: 'comboChart',
    icon: 'line-chart.svg',
    type: ViewElementTypeEnum.ComboChart,
    dataItemType: DataItemTypeEnum.Line,
    component: ActiveShapeComboChartComponent,
    optionsComponent: ActiveShapeComboChartOptionsComponent,
    isMnemoItem: true,
    isDashboardItem: true,
  },
  {
    name: 'pieChart',
    icon: 'pie-chart.svg',
    type: ViewElementTypeEnum.PieChart,
    component: ActiveShapePieChartComponent,
    optionsComponent: ActiveShapePieChartOptionsComponent,
    isMnemoItem: true,
    isDashboardItem: true,
  },
  {
    name: 'table',
    icon: 'table.svg',
    type: ViewElementTypeEnum.Table,
    component: ActiveShapeTableComponent,
    optionsComponent: ActiveShapeTableOptionsComponent,
    isMnemoItem: true,
    isDashboardItem: true,
  },
  {
    name: 'singleValue',
    type: ViewElementTypeEnum.SingleValue,
    component: ActiveShapeSingleValueComponent,
    optionsComponent: ActiveShapeSingleValueOptionsComponent,
    isMnemoItem: false,
    isDashboardItem: false,
  },
  {
    name: 'progressiveChart',
    icon: 'line-chart.svg',
    type: ViewElementTypeEnum.ProgressiveChart,
    component: ActiveShapeProgressChartComponent,
    isMnemoItem: false,
    isDashboardItem: false,
  },
  // endregion

  // region дашборды
  {
    name: 'combChart',
    icon: 'line-chart.svg',
    type: ViewElementTypeEnum.CombChart,
    component: ActiveShapeMultiLineChartComponent,
    optionsComponent: ActiveShapeMultiLineChartOptionsComponent,
    isMnemoItem: false,
    isDashboardItem: true,
  },
  // endregion
];
