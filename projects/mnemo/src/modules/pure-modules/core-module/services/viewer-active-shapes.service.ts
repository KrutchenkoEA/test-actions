/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { mxCell } from 'mxgraph';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ViewerActiveShapesService {
  public activeShapesInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  /** Набор ячеек с активными элементами для мнемосхем */
  public activeShapesSet$: BehaviorSubject<Set<mxCell> | null> = new BehaviorSubject<Set<mxCell> | null>(new Set());
}
