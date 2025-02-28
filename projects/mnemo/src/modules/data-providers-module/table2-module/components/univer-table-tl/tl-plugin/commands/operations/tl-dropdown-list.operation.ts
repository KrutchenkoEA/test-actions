/* eslint-disable import/no-extraneous-dependencies */
import type { ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import {
  TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID,
  TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID,
} from '../../controllers/menu/dropdown-list.menu';

export const TlDropdownListFirstItemOperation: ICommand = {
  id: TL_MENU_DROPDOWN_LIST_OPERATION_FIRST_ID,
  type: CommandType.OPERATION,
  handler: async () => {
    // eslint-disable-next-line no-alert
    alert('Dropdown list first item operation');
    return true;
  },
};

export const TlDropdownListSecondItemOperation: ICommand = {
  id: TL_MENU_DROPDOWN_LIST_OPERATION_SECOND_ID,
  type: CommandType.OPERATION,
  handler: async () => {
    // eslint-disable-next-line no-alert
    alert('Dropdown list second item operation');
    return true;
  },
};
