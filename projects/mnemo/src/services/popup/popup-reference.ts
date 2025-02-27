/* eslint-disable import/no-extraneous-dependencies */
import { OverlayRef } from '@angular/cdk/overlay';
import { Observable, Subject } from 'rxjs';

export class PopupReference<T> {
  private readonly closeBroadcast$ = new Subject<T | unknown>();

  constructor(private readonly overlayRef: OverlayRef) {}

  public close<V>(result: V | unknown): void {
    this.overlayRef.dispose();
    this.closeBroadcast$.next(result);
  }

  public afterClosed(): Observable<T | unknown> {
    return this.closeBroadcast$.asObservable();
  }

  public updatePopupPosition(): void {
    this.overlayRef?.updatePosition();
  }
}
