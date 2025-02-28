/* eslint-disable import/no-extraneous-dependencies */
import { ContextMenuGroup, ContextMenuPosition, MenuSchemaType } from '@univerjs/ui';
import { TL_SET_MANUAL_TAG_COMMAND_ID, TLSetManualTagFactory } from '../button/set-manual-tag.button';
import { TL_SHOW_CHART_OPERATION_ID, TLShowChartFactory } from '../button/show-chart.button';

export const viewerMenuSchema: MenuSchemaType = {
  [ContextMenuPosition.MAIN_AREA]: {
    [ContextMenuGroup.DATA]: {
      [TL_SHOW_CHART_OPERATION_ID]: {
        order: 20,
        menuItemFactory: TLShowChartFactory,
      },
      [TL_SET_MANUAL_TAG_COMMAND_ID]: {
        order: 21,
        menuItemFactory: TLSetManualTagFactory,
      },
    },
  },
};
