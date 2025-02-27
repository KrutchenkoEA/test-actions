/* eslint-disable import/no-extraneous-dependencies */
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlayerService } from './player.service';

@Injectable()
export class PlayerModeService {
  private readonly playerService = inject(PlayerService);

  private readonly _isPlayerMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  public get isPlayerMode$(): BehaviorSubject<boolean> {
    return this._isPlayerMode$;
  }

  public get isPlayerMode(): boolean {
    return this._isPlayerMode$.value;
  }

  public playPlayer(): void {
    this.playerService._playPlayer();
  }

  public stopPlayer(): void {
    this.playerService._stopPlayer();
  }

  public playerModeOn(): void {
    this._isPlayerMode$.next(true);
  }

  public playerModeOff(): void {
    this._isPlayerMode$.next(false);
    this.playerService._clearPlayer();
  }
}
