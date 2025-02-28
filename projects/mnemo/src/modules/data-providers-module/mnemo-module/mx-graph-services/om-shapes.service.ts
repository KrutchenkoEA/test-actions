/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable new-cap */
/* eslint-disable func-names */
import { Injectable } from '@angular/core';
import { mxGraphExportObject } from 'mxgraph';

@Injectable()
export class OmShapesService {
  public registerShapes(mx: mxGraphExportObject): void {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    function OmShape(this, ...args): void {
      mx.mxRectangleShape.call(this, ...args);
    }

    mx.mxUtils.extend(OmShape, mx.mxRectangleShape);
    OmShape.prototype.constraints = [];
    mx.mxCellRenderer.registerShape('omShape', OmShape);

    // eslint-disable-next-line @typescript-eslint/naming-convention
    function OmShapePort(this, ...args): void {
      OmShape.call(this, ...args);
    }

    mx.mxUtils.extend(OmShapePort, OmShape);
    OmShapePort.prototype.constraints = [
      // new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false),
      // new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
      // new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false),
      // new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.5), false),
    ];
    mx.mxCellRenderer.registerShape('omShapePort', OmShapePort);
  }
}
