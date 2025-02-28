import { DataItemTypeEnum, IActiveShapesElement, ViewElementTypeEnum } from '../../../models';
import { ActiveShapeComboChartComponent } from './components/combo-chart/combo-chart.component';
import { ActiveShapePieChartComponent } from './components/pie-chart/pie-chart.component';
import { ActiveShapeTableComponent } from './components/table/table.component';
import { ActiveShapeMultiLineChartComponent } from './components/multi-line-chart/multi-line-chart.component';
import { ActiveShapeVerticalProgressBarComponent } from './components/vertical-progress-bar/vertical-progress-bar.component';

export const ACTIVE_SHAPES_PURE: IActiveShapesElement[] = [
  {
    name: 'verticalProgressBar',
    icon: 'progress.svg',
    type: ViewElementTypeEnum.VerticalProgressBar,
    component: ActiveShapeVerticalProgressBarComponent,
  },
  {
    name: 'comboChart',
    icon: 'line-chart.svg',
    type: ViewElementTypeEnum.ComboChart,
    dataItemType: DataItemTypeEnum.Line,
    component: ActiveShapeComboChartComponent,
  },
  {
    name: 'pieChart',
    icon: 'pie-chart.svg',
    type: ViewElementTypeEnum.PieChart,
    component: ActiveShapePieChartComponent,
  },
  {
    name: 'table',
    icon: 'table.svg',
    type: ViewElementTypeEnum.Table,
    component: ActiveShapeTableComponent,
  },
  {
    name: 'combChart',
    icon: 'line-chart.svg',
    type: ViewElementTypeEnum.CombChart,
    component: ActiveShapeMultiLineChartComponent,
  },
];
