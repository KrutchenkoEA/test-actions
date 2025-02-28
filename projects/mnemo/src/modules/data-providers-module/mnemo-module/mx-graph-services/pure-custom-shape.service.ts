/* eslint-disable no-inner-declarations */
/* eslint-disable new-cap */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { mxGraphExportObject } from 'mxgraph';

/** Для регистрации кастомных шейпов в конструкторе и вьювере */
@Injectable()
export class PureCustomShapeService {
  public registerShapes(mx: mxGraphExportObject): void {
    this.registerCustomShape(mx);
  }

  private registerCustomShape(mx: mxGraphExportObject): void {
    function CustomShape(this, ...args): void {
      mx.mxShape.call(this, ...args);
    }

    mx.mxUtils.extend(CustomShape, mx.mxShape);

    CustomShape.prototype.isHtmlAllowed = function (): boolean {
      return false;
    };

    mx.mxCellRenderer.registerShape('customShape', CustomShape);
  }
}
