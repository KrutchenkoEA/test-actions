/* eslint-disable import/no-extraneous-dependencies */
import type { IAccessor, ICommand } from '@univerjs/core';
import { CommandType } from '@univerjs/core';
import { IUniverTableTlCommandService, UtTlCommandService } from '../../../services';
import { TL_ADD_MANUAL_TAG_COMMAND_ID } from '../../controllers/button/add-manual-tag.button';

export const TlAddManualTagCommand: ICommand = {
  id: TL_ADD_MANUAL_TAG_COMMAND_ID,
  type: CommandType.COMMAND,
  handler: async (accessor: IAccessor) => {
    const service = accessor.get(IUniverTableTlCommandService) as UtTlCommandService;
    service.openManualTagModal$.next(new Date());
    return true;
  },
};
