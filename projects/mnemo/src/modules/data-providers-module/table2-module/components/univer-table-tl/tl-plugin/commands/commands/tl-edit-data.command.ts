/* eslint-disable import/no-extraneous-dependencies */
import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IUniverTableTlCommandService, UtTlCommandService } from '../../../services';
import { TL_EDIT_DATA_COMMAND_ID } from '../../controllers/button/data-edit.button';

export const TlEditDataCommand: ICommand = {
  id: TL_EDIT_DATA_COMMAND_ID,
  type: CommandType.COMMAND,
  handler: async (accessor: IAccessor) => {
    const service = accessor.get(IUniverTableTlCommandService) as UtTlCommandService;
    service.openModal$.next(new Date());
    return true;
  },
};
