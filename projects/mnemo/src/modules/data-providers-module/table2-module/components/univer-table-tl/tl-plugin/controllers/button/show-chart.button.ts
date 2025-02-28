/* eslint-disable import/no-extraneous-dependencies */
import { IMenuButtonItem, MenuItemType } from '@univerjs/ui';

export const TL_SHOW_CHART_OPERATION_ID = 'tl.operation.show-chart';

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLShowChartFactory = (): IMenuButtonItem => {
  return {
    id: TL_SHOW_CHART_OPERATION_ID,
    type: MenuItemType.BUTTON,
    title: 'tl.button.showChart',
    icon: 'FxSingle',
    tooltip: 'tl.button.showChart',
  };
};
