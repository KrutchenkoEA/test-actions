/* eslint-disable import/no-extraneous-dependencies */
import { MenuItemType } from '@univerjs/ui';

export const TL_MENU_DROPDOWN_LIST_OPERATION_ID = 'tl.operation.dropdown-list';
export const TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID = 'tl.operation.dropdown-list-first';
export const TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID = 'tl.operation.dropdown-list-second';

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLMenuItemDropdownListMainButtonFactory = () => {
  return {
    id: TL_MENU_DROPDOWN_LIST_OPERATION_ID,
    type: MenuItemType.SUBITEMS,
    icon: 'FxSingle',
    title: 'tl.dropDown.dropdown',
    tooltip: 'tl.dropDown.dropdown',
  };
};

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLMenuItemDropdownListFirstItemFactory = () => {
  return {
    id: TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID,
    type: MenuItemType.BUTTON,
    icon: 'FxSingle',
    title: 'tl.dropDown.itemOne',
  };
};

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/explicit-function-return-type
export const TLMenuItemDropdownListSecondItemFactory = () => {
  return {
    id: TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID,
    type: MenuItemType.BUTTON,
    icon: 'FxSingle',
    title: 'tl.dropDown.itemTwo',
  };
};
