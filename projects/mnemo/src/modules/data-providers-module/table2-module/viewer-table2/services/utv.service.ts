/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class UtvService {
  public univerTableDestroy$: Subject<null> = new Subject<null>();

  public destroy(): void {
    this.univerTableDestroy$.next(null);
    this.univerTableDestroy$.complete();
  }
}
