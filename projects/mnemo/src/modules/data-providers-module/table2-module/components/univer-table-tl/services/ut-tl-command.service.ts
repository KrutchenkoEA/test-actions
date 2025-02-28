/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { createIdentifier, Disposable } from '@univerjs/core';
import { Subject } from 'rxjs';
import { IUTTableCellData, IUTTableCellDataCustom } from '../../../../../../models';

export interface IUniverTableTlCommandService {
  openModal$: Subject<Date | null>;
  openManualTagModal$: Subject<Date | null>;
  showChart$: Subject<IUTTableCellDataCustom | null>;
  setManualTag$: Subject<IUTTableCellData | null>;
}

// eslint-disable-next-line @typescript-eslint/naming-convention,@typescript-eslint/no-redeclare
export const IUniverTableTlCommandService = createIdentifier<IUniverTableTlCommandService>(
  `univer.tl-command-${Date.now()}`
);
// export const IUniverTableTlCommandService = null;

/* Сервис для обработки внутренних событий в Angular компонентах, получать в handel через accessor * */
@Injectable()
export class UtTlCommandService extends Disposable implements IUniverTableTlCommandService {
  public openModal$: Subject<Date | null> = new Subject<Date | null>();
  public openManualTagModal$: Subject<Date | null> = new Subject<Date | null>();
  public showChart$: Subject<IUTTableCellDataCustom | null> = new Subject<IUTTableCellDataCustom | null>();
  public setManualTag$: Subject<IUTTableCellData | null> = new Subject<IUTTableCellData | null>();

  public override dispose(): void {
    super.dispose();
  }
}
