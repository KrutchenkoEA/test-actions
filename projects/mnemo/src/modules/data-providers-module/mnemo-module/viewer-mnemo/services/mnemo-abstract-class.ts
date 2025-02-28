/* eslint-disable import/no-extraneous-dependencies */
import { mxGraph } from 'mxgraph';
import { ElementRef } from '@angular/core';
import { MnemoServiceAbstract } from '../../../../pure-modules';

export abstract class MnemoAbstractClass extends MnemoServiceAbstract {
  public abstract graph: mxGraph;
  public abstract graphContainer?: ElementRef<HTMLElement>;

  public abstract init(graph: mxGraph, graphContainer?: ElementRef<HTMLElement>): void;
}
