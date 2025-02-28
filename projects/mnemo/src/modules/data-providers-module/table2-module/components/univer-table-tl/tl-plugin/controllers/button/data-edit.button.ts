/* eslint-disable import/no-extraneous-dependencies */
import { IMenuButtonItem, MenuItemType } from '@univerjs/ui';

export const TL_EDIT_DATA_COMMAND_ID = 'tl.command.edit-data';

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLDataEditFactory = (): IMenuButtonItem => {
  return {
    id: TL_EDIT_DATA_COMMAND_ID,
    type: MenuItemType.BUTTON,
    title: 'tl.button.editData',
    icon: 'FxSingle',
    tooltip: 'tl.button.editData',
  };
};
