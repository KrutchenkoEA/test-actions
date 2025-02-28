/* eslint-disable import/no-extraneous-dependencies */
import { mxGraph } from 'mxgraph';
import { ElementRef } from '@angular/core';

export abstract class MnemoGraphAbstract {
  abstract graph: mxGraph;
  abstract graphContainer?: ElementRef<HTMLElement>;

  abstract init(graph: mxGraph, ...args): void;

  abstract destroy(): void;
}
