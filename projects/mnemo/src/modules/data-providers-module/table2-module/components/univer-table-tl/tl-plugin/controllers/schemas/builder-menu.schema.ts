/* eslint-disable import/no-extraneous-dependencies */
import { ContextMenuGroup, ContextMenuPosition, MenuSchemaType, RibbonStartGroup } from '@univerjs/ui';
import { TL_EDIT_DATA_COMMAND_ID, TLDataEditFactory } from '../button/data-edit.button';
import { TL_ADD_MANUAL_TAG_COMMAND_ID, TLAddManualTagFactory } from '../button/add-manual-tag.button';
import {
  TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID,
  TL_MENU_DROPDOWN_LIST_OPERATION_ID,
  TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID,
  TLMenuItemDropdownListFirstItemFactory,
  TLMenuItemDropdownListMainButtonFactory,
  TLMenuItemDropdownListSecondItemFactory,
} from '../menu/dropdown-list.menu';

export const builderMenuSchema: MenuSchemaType = {
  [RibbonStartGroup.OTHERS]: {
    [TL_EDIT_DATA_COMMAND_ID]: {
      order: 0,
      menuItemFactory: TLDataEditFactory,
    },
    [TL_ADD_MANUAL_TAG_COMMAND_ID]: {
      order: 1,
      menuItemFactory: TLAddManualTagFactory,
    },
  },
  [ContextMenuPosition.MAIN_AREA]: {
    [ContextMenuGroup.DATA]: {
      [TL_EDIT_DATA_COMMAND_ID]: {
        order: 20,
        menuItemFactory: TLDataEditFactory,
      },
      [TL_ADD_MANUAL_TAG_COMMAND_ID]: {
        order: 21,
        menuItemFactory: TLAddManualTagFactory,
      },
      [TL_MENU_DROPDOWN_LIST_OPERATION_ID]: {
        order: 22,
        menuItemFactory: TLMenuItemDropdownListMainButtonFactory,
        [TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID]: {
          order: 0,
          menuItemFactory: TLMenuItemDropdownListFirstItemFactory,
        },
        [TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID]: {
          order: 1,
          menuItemFactory: TLMenuItemDropdownListSecondItemFactory,
        },
      },
    },
  },
};
