/* eslint-disable import/no-extraneous-dependencies */
import {
  CommandType,
  IAccessor,
  ICommand,
  IUniverInstanceService,
  UniverInstanceType,
  Workbook,
  Worksheet,
} from '@univerjs/core';
import { SheetsSelectionsService } from '@univerjs/sheets';
import { IUTTableCellData } from '../../../../../../../../models';
import { IUniverTableTlCommandService, UtTlCommandService } from '../../../services';
import { TL_SET_MANUAL_TAG_COMMAND_ID } from '../../controllers/button/set-manual-tag.button';

export const TlSetManualTagCommand: ICommand = {
  id: TL_SET_MANUAL_TAG_COMMAND_ID,
  type: CommandType.OPERATION,
  handler: async (accessor: IAccessor) => {
    const selectionManagerService = accessor.get(SheetsSelectionsService);

    const selection = selectionManagerService.getCurrentSelections();
    if (!selection) return false;

    const univerInstanceService = accessor.get(IUniverInstanceService);
    const tlCommandService = accessor.get(IUniverTableTlCommandService) as UtTlCommandService;

    const { range } = selection[0];
    const { startRow: ri, startColumn: ci } = range;

    const worksheet: Worksheet = univerInstanceService
      .getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)
      // @ts-ignore
      ?.getActiveSheet();
    if (!worksheet) return false;

    const cell = worksheet.getCell(ri, ci) as IUTTableCellData;

    tlCommandService.setManualTag$.next(cell);
    return true;
  },
};
