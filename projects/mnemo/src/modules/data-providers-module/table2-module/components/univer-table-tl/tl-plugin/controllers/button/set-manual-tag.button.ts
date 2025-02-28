/* eslint-disable import/no-extraneous-dependencies */
import { IMenuButtonItem, MenuItemType } from '@univerjs/ui';

export const TL_SET_MANUAL_TAG_COMMAND_ID = 'tl.command.set-manual-tag';

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLSetManualTagFactory = (): IMenuButtonItem => {
  return {
    id: TL_SET_MANUAL_TAG_COMMAND_ID,
    type: MenuItemType.BUTTON,
    title: 'tl.button.setManualTag',
    icon: 'FxSingle',
    tooltip: 'tl.button.setManualTag',
  };
};
