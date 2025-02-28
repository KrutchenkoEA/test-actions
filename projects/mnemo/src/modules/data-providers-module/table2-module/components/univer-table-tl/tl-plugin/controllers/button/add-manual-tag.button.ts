/* eslint-disable import/no-extraneous-dependencies */
import { IMenuButtonItem, MenuItemType } from '@univerjs/ui';

export const TL_ADD_MANUAL_TAG_COMMAND_ID = 'tl.command.add-manual-tag';

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLAddManualTagFactory = (): IMenuButtonItem => {
  return {
    id: TL_ADD_MANUAL_TAG_COMMAND_ID,
    type: MenuItemType.BUTTON,
    title: 'tl.button.addManualTag',
    icon: 'FxSingle',
    tooltip: 'tl.button.addManualTag',
  };
};
