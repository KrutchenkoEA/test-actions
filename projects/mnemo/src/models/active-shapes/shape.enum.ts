export enum ShapeTypeEnum {
  Geometry = 'geometry-shape',
  Svg = 'svg-shape',
  DataShape = 'data-shape',
  UserImage = 'user-image-shape',
  HtmlShape = 'html-shape',
  ActiveElement = 'active-element',
  OmShape = 'om-shape',
  OmShapePort = 'om-shape-port',
  OmShapeUnset = 'om-shape-unset',
  OmShapeCollapsed = 'om-shape-collapsed',
}

export enum ActiveElementTypeEnum {
  VerticalProgressBar = 'vertical-progress-bar',
  LineChart = 'line-chart',
  BarChart = 'bar-chart',
  PieChart = 'pie-chart',
}

export enum ViewElementTypeEnum {
  /** @deprecated tlui-layer-chart */
  CombChart = 'comb-chart',
  Table = 'table',
  SingleValue = 'single-value',
  PieChart = 'pie-chart',
  ComboChart = 'combo-chart',
  ProgressiveChart = 'progressive-chart',
  VerticalProgressBar = 'vertical-progress-bar',
}

export enum DataItemTypeEnum {
  Null = 'null',
  Line = 'line',
  Area = 'area',
  GradientArea = 'gradientArea',
  Bar = 'bar',
  BarHorizontal = 'barHorizontal',
  ComboBar = 'comboBar',
  ComboBarHorizontal = 'comboBarHorizontal',
  StackBar = 'stackBar',
  StackBarHorizontal = 'stackBarHorizontal',
  /** @deprecated tlui-layer-chart */
  FullStackBar = 'fullStackBar',
}

