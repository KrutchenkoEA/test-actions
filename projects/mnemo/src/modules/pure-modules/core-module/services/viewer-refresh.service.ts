/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ViewerRefreshService {
  private readonly _isUpdateData$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  public get isUpdateData$(): BehaviorSubject<boolean> {
    return this._isUpdateData$;
  }

  public startUpdate(): void {
    this._isUpdateData$.next(true);
  }

  public stopUpdate(): void {
    this._isUpdateData$.next(false);
  }
}
