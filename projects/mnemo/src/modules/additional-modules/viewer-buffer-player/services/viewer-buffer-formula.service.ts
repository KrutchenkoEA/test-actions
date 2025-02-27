/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ITagHistoryData } from '../../../../models';

@Injectable()
export class ViewerBufferFormulaService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public getData(): Observable<boolean> {
    return of(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public createData(tags: ITagHistoryData[], isInit: boolean = false): void {}
}
