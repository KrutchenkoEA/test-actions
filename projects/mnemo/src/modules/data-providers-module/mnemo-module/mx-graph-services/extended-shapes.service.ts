/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-inner-declarations */
/* eslint-disable func-names */
/* eslint-disable new-cap */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable eqeqeq */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@angular/core';
import {
  mxCell,
  mxCellState,
  mxConnectionConstraint,
  mxGraphExportObject,
  mxHandle,
  mxPoint,
  mxRectangle,
} from 'mxgraph';

@Injectable()
export class ExtendedShapesService {
  public registerShapes(mx: mxGraphExportObject): void {
    this.registerGeneralShapes(mx);
  }

  private registerGeneralShapes(mx: mxGraphExportObject): void {
    // region Rectangle
    // Parallelogram shape
    function ParallelogramShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(ParallelogramShape, mx.mxActor);
    ParallelogramShape.prototype.size = 0.2;
    ParallelogramShape.prototype.fixedSize = 20;
    ParallelogramShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    ParallelogramShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const fixed = mx.mxUtils.getValue(this.style, 'fixedSize', '0') !== '0';

      const dx = fixed
        ? Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.fixedSize))))
        : w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [new mx.mxPoint(0, h), new mx.mxPoint(dx, 0), new mx.mxPoint(w, 0), new mx.mxPoint(w - dx, h)],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('parallelogram', ParallelogramShape);

    // Trapezoid shape
    function TrapezoidShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(TrapezoidShape, mx.mxActor);
    TrapezoidShape.prototype.size = 0.2;
    TrapezoidShape.prototype.fixedSize = 20;
    TrapezoidShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    TrapezoidShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const fixed = mx.mxUtils.getValue(this.style, 'fixedSize', '0') !== '0';

      const dx = fixed
        ? Math.max(0, Math.min(w * 0.5, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.fixedSize))))
        : w * Math.max(0, Math.min(0.5, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [new mx.mxPoint(0, h), new mx.mxPoint(dx, 0), new mx.mxPoint(w - dx, 0), new mx.mxPoint(w, h)],
        this.isRounded,
        arcSize,
        true
      );
    };
    mx.mxCellRenderer.registerShape('trapezoid', TrapezoidShape);

    // Step shape
    function StepShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(StepShape, mx.mxActor);
    StepShape.prototype.size = 0.2;
    StepShape.prototype.fixedSize = 20;
    StepShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    StepShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const fixed = mx.mxUtils.getValue(this.style, 'fixedSize', '0') !== '0';
      const s = fixed
        ? Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.fixedSize))))
        : w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, 0),
          new mx.mxPoint(w - s, 0),
          new mx.mxPoint(w, h / 2),
          new mx.mxPoint(w - s, h),
          new mx.mxPoint(0, h),
          new mx.mxPoint(s, h / 2),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('step', StepShape);

    // Process Shape
    function ProcessShape(this, ...args): void {
      mx.mxRectangleShape.call(this, ...args);
    }

    mx.mxUtils.extend(ProcessShape, mx.mxRectangleShape);
    ProcessShape.prototype.size = 0.1;
    ProcessShape.prototype.fixedSize = false;
    ProcessShape.prototype.isHtmlAllowed = function (): boolean {
      return false;
    };
    ProcessShape.prototype.getLabelBounds = function (rect): mxRectangle {
      if (
        mx.mxUtils.getValue(this.state.style, mx.mxConstants.STYLE_HORIZONTAL, true) ===
        (this.direction === null ||
          this.direction === mx.mxConstants.DIRECTION_EAST ||
          this.direction === mx.mxConstants.DIRECTION_WEST)
      ) {
        const w = rect.width;
        const h = rect.height;
        const r = new mx.mxRectangle(rect.x, rect.y, w, h);

        let inset = w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));

        if (this.isRounded) {
          const f =
            mx.mxUtils.getValue(
              this.style,
              mx.mxConstants.STYLE_ARCSIZE,
              mx.mxConstants.RECTANGLE_ROUNDING_FACTOR * 100
            ) / 100;
          inset = Math.max(inset, Math.min(w * f, h * f));
        }

        r.x += Math.round(inset);
        r.width -= Math.round(2 * inset);

        return r;
      }

      return rect;
    };
    ProcessShape.prototype.paintForeground = function (c, x, y, w, h): void {
      const isFixedSize = mx.mxUtils.getValue(this.style, 'fixedSize', this.fixedSize);
      let inset = parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size));

      if (isFixedSize) {
        inset = Math.max(0, Math.min(w, inset));
      } else {
        inset = w * Math.max(0, Math.min(1, inset));
      }

      if (this.isRounded) {
        const f =
          mx.mxUtils.getValue(
            this.style,
            mx.mxConstants.STYLE_ARCSIZE,
            mx.mxConstants.RECTANGLE_ROUNDING_FACTOR * 100
          ) / 100;
        inset = Math.max(inset, Math.min(w * f, h * f));
      }

      // Crisp rendering of inner lines
      inset = Math.round(inset);

      c.begin();
      c.moveTo(x + inset, y);
      c.lineTo(x + inset, y + h);
      c.moveTo(x + w - inset, y);
      c.lineTo(x + w - inset, y + h);
      c.end();
      c.stroke();
      mx.mxRectangleShape.prototype.paintForeground.apply(this, [c, x, y, w, h]);
    };
    mx.mxCellRenderer.registerShape('process', ProcessShape);

    // Cube Shape
    function CubeShape(this, ...args): void {
      mx.mxCylinder.call(this, ...args);
    }

    mx.mxUtils.extend(CubeShape, mx.mxCylinder);
    CubeShape.prototype.size = 20;
    CubeShape.prototype.darkOpacity = 0;
    CubeShape.prototype.darkOpacity2 = 0;
    CubeShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));
      const op = Math.max(
        -1,
        Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'darkOpacity', this.darkOpacity)))
      );
      const op2 = Math.max(
        -1,
        Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'darkOpacity2', this.darkOpacity2)))
      );
      c.translate(x, y);

      c.begin();
      c.moveTo(0, 0);
      c.lineTo(w - s, 0);
      c.lineTo(w, s);
      c.lineTo(w, h);
      c.lineTo(s, h);
      c.lineTo(0, h - s);
      c.lineTo(0, 0);
      c.close();
      c.end();
      c.fillAndStroke();

      if (!this.outline) {
        c.setShadow(false);

        if (op !== 0) {
          c.setFillAlpha(Math.abs(op));
          c.setFillColor(op < 0 ? '#FFFFFF' : '#000000');
          c.begin();
          c.moveTo(0, 0);
          c.lineTo(w - s, 0);
          c.lineTo(w, s);
          c.lineTo(s, s);
          c.close();
          c.fill();
        }

        if (op2 !== 0) {
          c.setFillAlpha(Math.abs(op2));
          c.setFillColor(op2 < 0 ? '#FFFFFF' : '#000000');
          c.begin();
          c.moveTo(0, 0);
          c.lineTo(s, s);
          c.lineTo(s, h);
          c.lineTo(0, h - s);
          c.close();
          c.fill();
        }

        c.begin();
        c.moveTo(s, h);
        c.lineTo(s, s);
        c.lineTo(0, 0);
        c.moveTo(s, s);
        c.lineTo(w, s);
        c.end();
        c.stroke();
      }
    };
    CubeShape.prototype.getLabelMargins = function (): mxRectangle {
      if (mx.mxUtils.getValue(this.style, 'boundedLbl', false)) {
        const s = parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)) * this.scale;

        return new mx.mxRectangle(s, s, 0, 0);
      }

      return null;
    };
    mx.mxCellRenderer.registerShape('cube', CubeShape);

    // Manual Input shape
    function ManualInputShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(ManualInputShape, mx.mxActor);
    ManualInputShape.prototype.size = 30;
    ManualInputShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    ManualInputShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const s = Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [new mx.mxPoint(0, h), new mx.mxPoint(0, s), new mx.mxPoint(w, 0), new mx.mxPoint(w, h)],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('manualInput', ManualInputShape);

    // Loop limit
    function LoopLimitShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(LoopLimitShape, mx.mxActor);
    LoopLimitShape.prototype.size = 20;
    LoopLimitShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    LoopLimitShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const s = Math.min(w / 2, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(s, 0),
          new mx.mxPoint(w - s, 0),
          new mx.mxPoint(w, s * 0.8),
          new mx.mxPoint(w, h),
          new mx.mxPoint(0, h),
          new mx.mxPoint(0, s * 0.8),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };

    mx.mxCellRenderer.registerShape('loopLimit', LoopLimitShape);

    // Off page connector
    function OffPageConnectorShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(OffPageConnectorShape, mx.mxActor);
    OffPageConnectorShape.prototype.size = 3 / 8;
    OffPageConnectorShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    OffPageConnectorShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const s = h * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, 0),
          new mx.mxPoint(w, 0),
          new mx.mxPoint(w, h - s),
          new mx.mxPoint(w / 2, h),
          new mx.mxPoint(0, h - s),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };

    mx.mxCellRenderer.registerShape('offPageConnector', OffPageConnectorShape);

    // Delay
    function DelayShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(DelayShape, mx.mxActor);
    DelayShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dx = Math.min(w, h / 2);
      c.moveTo(0, 0);
      c.lineTo(w - dx, 0);
      c.quadTo(w, 0, w, h / 2);
      c.quadTo(w, h, w - dx, h);
      c.lineTo(0, h);
      c.close();
      c.end();
    };

    mx.mxCellRenderer.registerShape('delay', DelayShape);

    // Display
    function DisplayShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(DisplayShape, mx.mxActor);
    DisplayShape.prototype.size = 0.25;
    DisplayShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dx = Math.min(w, h / 2);
      const s = Math.min(w - dx, Math.max(0, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))) * w);

      c.moveTo(0, h / 2);
      c.lineTo(s, 0);
      c.lineTo(w - dx, 0);
      c.quadTo(w, 0, w, h / 2);
      c.quadTo(w, h, w - dx, h);
      c.lineTo(s, h);
      c.close();
      c.end();
    };

    mx.mxCellRenderer.registerShape('display', DisplayShape);
    // endregion

    // region Triangle
    // Hexagon shape
    function HexagonShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(HexagonShape, mx.mxHexagon);
    HexagonShape.prototype.size = 0.25;
    HexagonShape.prototype.fixedSize = 20;
    HexagonShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    HexagonShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const fixed = mx.mxUtils.getValue(this.style, 'fixedSize', '0') !== '0';
      const s = fixed
        ? Math.max(0, Math.min(w * 0.5, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.fixedSize))))
        : w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(s, 0),
          new mx.mxPoint(w - s, 0),
          new mx.mxPoint(w, 0.5 * h),
          new mx.mxPoint(w - s, h),
          new mx.mxPoint(s, h),
          new mx.mxPoint(0, 0.5 * h),
        ],
        this.isRounded,
        arcSize,
        true
      );
    };
    mx.mxCellRenderer.registerShape('hexagon', HexagonShape);

    // SortShape
    function SortShape(this, ...args): void {
      mx.mxRhombus.call(this, ...args);
    }

    mx.mxUtils.extend(SortShape, mx.mxRhombus);
    SortShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      mx.mxRhombus.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);

      c.setShadow(false);
      c.begin();
      c.moveTo(x, y + h / 2);
      c.lineTo(x + w, y + h / 2);
      c.end();
      c.stroke();
    };

    mx.mxCellRenderer.registerShape('sortShape', SortShape);

    // CollateShape
    function CollateShape(this, ...args): void {
      mx.mxEllipse.call(this, ...args);
    }

    mx.mxUtils.extend(CollateShape, mx.mxEllipse);
    CollateShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      c.begin();
      c.moveTo(x, y);
      c.lineTo(x + w, y);
      c.lineTo(x + w / 2, y + h / 2);
      c.close();
      c.fillAndStroke();

      c.begin();
      c.moveTo(x, y + h);
      c.lineTo(x + w, y + h);
      c.lineTo(x + w / 2, y + h / 2);
      c.close();
      c.fillAndStroke();
    };

    mx.mxCellRenderer.registerShape('collate', CollateShape);

    // Switch Shape, supports size style
    function SwitchShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(SwitchShape, mx.mxActor);
    SwitchShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const curve = 0.5;
      c.moveTo(0, 0);
      c.quadTo(w / 2, h * curve, w, 0);
      c.quadTo(w * (1 - curve), h / 2, w, h);
      c.quadTo(w / 2, h * (1 - curve), 0, h);
      c.quadTo(w * curve, h / 2, 0, 0);
      c.end();
    };

    mx.mxCellRenderer.registerShape('switch', SwitchShape);
    // endregion

    // region Circle
    // Flexible cylinder3 Shape with offset label
    function CylinderShape3(this, bounds, fill, stroke, strokewidth): void {
      mx.mxShape.call(this, bounds, fill, stroke, strokewidth);
      this.bounds = bounds;
      this.fill = fill;
      this.stroke = stroke;
      this.strokewidth = strokewidth !== null ? strokewidth : 1;
    }

    mx.mxUtils.extend(CylinderShape3, mx.mxCylinder);
    CylinderShape3.prototype.size = 15;
    CylinderShape3.prototype.paintVertexShape = function (c, x, y, w, h): void {
      const size = Math.max(0, Math.min(h * 0.5, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const lid = mx.mxUtils.getValue(this.style, 'lid', true);

      c.translate(x, y);

      if (size === 0) {
        c.rect(0, 0, w, h);
        c.fillAndStroke();
      } else {
        c.begin();

        if (lid) {
          c.moveTo(0, size);
          c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, 0);
          c.arcTo(w * 0.5, size, 0, 0, 1, w, size);
        } else {
          c.moveTo(0, 0);
          c.arcTo(w * 0.5, size, 0, 0, 0, w * 0.5, size);
          c.arcTo(w * 0.5, size, 0, 0, 0, w, 0);
        }

        c.lineTo(w, h - size);
        c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, h);
        c.arcTo(w * 0.5, size, 0, 0, 1, 0, h - size);
        c.close();
        c.fillAndStroke();

        c.setShadow(false);

        if (lid) {
          c.begin();
          c.moveTo(w, size);
          c.arcTo(w * 0.5, size, 0, 0, 1, w * 0.5, 2 * size);
          c.arcTo(w * 0.5, size, 0, 0, 1, 0, size);
          c.stroke();
        }
      }
    };
    mx.mxCellRenderer.registerShape('cylinder3', CylinderShape3);

    // DataStore Shape, supports size style
    function DataStoreShape(this, ...args): void {
      mx.mxCylinder.call(this, ...args);
    }

    mx.mxUtils.extend(DataStoreShape, mx.mxCylinder);

    DataStoreShape.prototype.redrawPath = function (c, x, y, w, h, isForeground): void {
      const dy = Math.min(h / 2, Math.round(h / 8) + this.strokewidth - 1);

      if ((isForeground && this.fill != null) || (!isForeground && this.fill == null)) {
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }

        c.translate(0, dy / 2);
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }

        c.translate(0, dy / 2);
        c.moveTo(0, dy);
        c.curveTo(0, 2 * dy, w, 2 * dy, w, dy);

        // Needs separate shapes for correct hit-detection
        if (!isForeground) {
          c.stroke();
          c.begin();
        }

        c.translate(0, -dy);
      }

      if (!isForeground) {
        c.moveTo(0, dy);
        c.curveTo(0, -dy / 3, w, -dy / 3, w, dy);
        c.lineTo(w, h - dy);
        c.curveTo(w, h + dy / 3, 0, h + dy / 3, 0, h - dy);
        c.close();
      }
    };
    DataStoreShape.prototype.getLabelMargins = function (rect): mxRectangle {
      return new mx.mxRectangle(
        0,
        2.5 * Math.min(rect.height / 2, Math.round(rect.height / 8) + this.strokewidth - 1),
        0,
        0
      );
    };

    mx.mxCellRenderer.registerShape('datastore', DataStoreShape);

    // Tape Data Shape
    function TapeDataShape(this, ...args): void {
      mx.mxEllipse.call(this, ...args);
    }

    mx.mxUtils.extend(TapeDataShape, mx.mxEllipse);
    TapeDataShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      mx.mxEllipse.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);

      c.begin();
      c.moveTo(x + w / 2, y + h);
      c.lineTo(x + w, y + h);
      c.end();
      c.stroke();
    };

    mx.mxCellRenderer.registerShape('tapeData', TapeDataShape);

    // OrEllipseShape
    function OrEllipseShape(this, ...args): void {
      mx.mxEllipse.call(this, ...args);
    }

    mx.mxUtils.extend(OrEllipseShape, mx.mxEllipse);
    OrEllipseShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      mx.mxEllipse.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);

      c.setShadow(false);
      c.begin();
      c.moveTo(x, y + h / 2);
      c.lineTo(x + w, y + h / 2);
      c.end();
      c.stroke();

      c.begin();
      c.moveTo(x + w / 2, y);
      c.lineTo(x + w / 2, y + h);
      c.end();
      c.stroke();
    };

    mx.mxCellRenderer.registerShape('orEllipse', OrEllipseShape);

    // SumEllipseShape
    function SumEllipseShape(this, ...args): void {
      mx.mxEllipse.call(this, ...args);
    }

    mx.mxUtils.extend(SumEllipseShape, mx.mxEllipse);
    SumEllipseShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      mx.mxEllipse.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);
      const s2 = 0.145;

      c.setShadow(false);
      c.begin();
      c.moveTo(x + w * s2, y + h * s2);
      c.lineTo(x + w * (1 - s2), y + h * (1 - s2));
      c.end();
      c.stroke();

      c.begin();
      c.moveTo(x + w * (1 - s2), y + h * s2);
      c.lineTo(x + w * s2, y + h * (1 - s2));
      c.end();
      c.stroke();
    };

    mx.mxCellRenderer.registerShape('sumEllipse', SumEllipseShape);

    // LineEllipseShape
    function LineEllipseShape(this, ...args): void {
      mx.mxEllipse.call(this, ...args);
    }

    mx.mxUtils.extend(LineEllipseShape, mx.mxEllipse);
    LineEllipseShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      mx.mxEllipse.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);

      c.setShadow(false);
      c.begin();

      if (mx.mxUtils.getValue(this.style, 'line') == 'vertical') {
        c.moveTo(x + w / 2, y);
        c.lineTo(x + w / 2, y + h);
      } else {
        c.moveTo(x, y + h / 2);
        c.lineTo(x + w, y + h / 2);
      }

      c.end();
      c.stroke();
    };

    mx.mxCellRenderer.registerShape('lineEllipse', LineEllipseShape);
    // endregion

    // region Rectangle2
    // Internal storage
    function InternalStorageShape(this, ...args): void {
      mx.mxRectangleShape.call(this, ...args);
    }

    mx.mxUtils.extend(InternalStorageShape, mx.mxRectangleShape);
    InternalStorageShape.prototype.dx = 20;
    InternalStorageShape.prototype.dy = 20;
    InternalStorageShape.prototype.isHtmlAllowed = function (): boolean {
      return false;
    };
    InternalStorageShape.prototype.paintForeground = function (c, x, y, w, h): void {
      mx.mxRectangleShape.prototype.paintForeground.apply(this, [c, x, y, w, h]);
      let inset = 0;

      if (this.isRounded) {
        const f =
          mx.mxUtils.getValue(
            this.style,
            mx.mxConstants.STYLE_ARCSIZE,
            mx.mxConstants.RECTANGLE_ROUNDING_FACTOR * 100
          ) / 100;
        inset = Math.max(inset, Math.min(w * f, h * f));
      }

      const dx = Math.max(inset, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'dx', this.dx))));
      const dy = Math.max(inset, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'dy', this.dy))));

      c.begin();
      c.moveTo(x, y + dy);
      c.lineTo(x + w, y + dy);
      c.end();
      c.stroke();

      c.begin();
      c.moveTo(x + dx, y);
      c.lineTo(x + dx, y + h);
      c.end();
      c.stroke();
    };
    mx.mxCellRenderer.registerShape('internalStorage', InternalStorageShape);

    // Tape shape
    function TapeShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(TapeShape, mx.mxActor);
    TapeShape.prototype.size = 0.4;
    TapeShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dy = h * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const fy = 1.4;

      c.moveTo(0, dy / 2);
      c.quadTo(w / 4, dy * fy, w / 2, dy / 2);
      c.quadTo((w * 3) / 4, dy * (1 - fy), w, dy / 2);
      c.lineTo(w, h - dy / 2);
      c.quadTo((w * 3) / 4, h - dy * fy, w / 2, h - dy / 2);
      c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
      c.lineTo(0, dy / 2);
      c.close();
      c.end();
    };
    TapeShape.prototype.getLabelBounds = function (rect): mxRectangle {
      if (mx.mxUtils.getValue(this.style, 'boundedLbl', false)) {
        const size = mx.mxUtils.getValue(this.style, 'size', this.size);
        const w = rect.width;
        const h = rect.height;

        if (
          this.direction === null ||
          this.direction === mx.mxConstants.DIRECTION_EAST ||
          this.direction === mx.mxConstants.DIRECTION_WEST
        ) {
          const dy = h * size;

          return new mx.mxRectangle(rect.x, rect.y + dy, w, h - 2 * dy);
        }
        const dx = w * size;

        return new mx.mxRectangle(rect.x + dx, rect.y, w - 2 * dx, h);
      }

      return rect;
    };
    mx.mxCellRenderer.registerShape('tape', TapeShape);

    // Document shape
    function DocumentShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(DocumentShape, mx.mxActor);
    DocumentShape.prototype.size = 0.3;
    DocumentShape.prototype.getLabelMargins = function (rect): mxRectangle {
      if (mx.mxUtils.getValue(this.style, 'boundedLbl', false)) {
        return new mx.mxRectangle(
          0,
          0,
          0,
          parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)) * rect.height
        );
      }

      return null;
    };
    DocumentShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dy = h * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const fy = 1.4;

      c.moveTo(0, 0);
      c.lineTo(w, 0);
      c.lineTo(w, h - dy / 2);
      c.quadTo((w * 3) / 4, h - dy * fy, w / 2, h - dy / 2);
      c.quadTo(w / 4, h - dy * (1 - fy), 0, h - dy / 2);
      c.lineTo(0, dy / 2);
      c.close();
      c.end();
    };
    mx.mxCellRenderer.registerShape('document', DocumentShape);

    // Note Shape, supports size style
    function NoteShape(this, ...args): void {
      mx.mxCylinder.call(this, ...args);
    }

    mx.mxUtils.extend(NoteShape, mx.mxCylinder);
    NoteShape.prototype.size = 30;
    NoteShape.prototype.darkOpacity = 0;
    NoteShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));
      const op = Math.max(
        -1,
        Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'darkOpacity', this.darkOpacity)))
      );
      c.translate(x, y);

      c.begin();
      c.moveTo(0, 0);
      c.lineTo(w - s, 0);
      c.lineTo(w, s);
      c.lineTo(w, h);
      c.lineTo(0, h);
      c.lineTo(0, 0);
      c.close();
      c.end();
      c.fillAndStroke();

      if (!this.outline) {
        c.setShadow(false);

        if (op !== 0) {
          c.setFillAlpha(Math.abs(op));
          c.setFillColor(op < 0 ? '#FFFFFF' : '#000000');
          c.begin();
          c.moveTo(w - s, 0);
          c.lineTo(w - s, s);
          c.lineTo(w, s);
          c.close();
          c.fill();
        }

        c.begin();
        c.moveTo(w - s, 0);
        c.lineTo(w - s, s);
        c.lineTo(w, s);
        c.end();
        c.stroke();
      }
    };
    mx.mxCellRenderer.registerShape('note', NoteShape);

    // Card shape
    function CardShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(CardShape, mx.mxActor);
    CardShape.prototype.size = 30;
    CardShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    CardShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [new mx.mxPoint(s, 0), new mx.mxPoint(w, 0), new mx.mxPoint(w, h), new mx.mxPoint(0, h), new mx.mxPoint(0, s)],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('card', CardShape);

    // Callout shape
    function CalloutShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(CalloutShape, mx.mxHexagon);
    CalloutShape.prototype.size = 30;
    CalloutShape.prototype.position = 0.5;
    CalloutShape.prototype.position2 = 0.5;
    CalloutShape.prototype.base = 20;
    CalloutShape.prototype.getLabelMargins = function (): mxRectangle {
      return new mx.mxRectangle(0, 0, 0, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)) * this.scale);
    };
    CalloutShape.prototype.isRoundable = function (): boolean {
      return true;
    };
    CalloutShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      const s = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const dx = w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'position', this.position))));
      const dx2 =
        w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'position2', this.position2))));
      const base = Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'base', this.base))));

      this.addPoints(
        c,
        [
          new mx.mxPoint(0, 0),
          new mx.mxPoint(w, 0),
          new mx.mxPoint(w, h - s),
          new mx.mxPoint(Math.min(w, dx + base), h - s),
          new mx.mxPoint(dx2, h),
          new mx.mxPoint(Math.max(0, dx), h - s),
          new mx.mxPoint(0, h - s),
        ],
        this.isRounded,
        arcSize,
        true,
        [4]
      );
    };
    mx.mxCellRenderer.registerShape('callout', CalloutShape);

    // Cross Shape
    function CrossShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(CrossShape, mx.mxActor);
    CrossShape.prototype.size = 0.2;
    CrossShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const m = Math.min(h, w);
      const size = Math.max(0, Math.min(m, m * parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const t = (h - size) / 2;
      const b = t + size;
      const l = (w - size) / 2;
      const r = l + size;

      c.moveTo(0, t);
      c.lineTo(l, t);
      c.lineTo(l, 0);
      c.lineTo(r, 0);
      c.lineTo(r, t);
      c.lineTo(w, t);
      c.lineTo(w, b);
      c.lineTo(r, b);
      c.lineTo(r, h);
      c.lineTo(l, h);
      c.lineTo(l, b);
      c.lineTo(0, b);
      c.close();
      c.end();
    };

    mx.mxCellRenderer.registerShape('cross', CrossShape);

    // Corner shape
    function CornerShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(CornerShape, mx.mxActor);
    CornerShape.prototype.dx = 20;
    CornerShape.prototype.dy = 20;
    CornerShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dx = Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'dx', this.dx))));
      const dy = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'dy', this.dy))));

      const s = Math.min(w / 2, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, 0),
          new mx.mxPoint(w, 0),
          new mx.mxPoint(w, dy),
          new mx.mxPoint(dx, dy),
          new mx.mxPoint(dx, h),
          new mx.mxPoint(0, h),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('corner', CornerShape);

    // Tee shape
    function TeeShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(TeeShape, mx.mxActor);
    TeeShape.prototype.dx = 20;
    TeeShape.prototype.dy = 20;
    TeeShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const dx = Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'dx', this.dx))));
      const dy = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'dy', this.dy))));
      const w2 = Math.abs(w - dx) / 2;
      const s = Math.min(w / 2, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, 0),
          new mx.mxPoint(w, 0),
          new mx.mxPoint(w, dy),
          new mx.mxPoint((w + dx) / 2, dy),
          new mx.mxPoint((w + dx) / 2, h),
          new mx.mxPoint((w - dx) / 2, h),
          new mx.mxPoint((w - dx) / 2, dy),
          new mx.mxPoint(0, dy),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('tee', TeeShape);
    // endregion

    // region Actor
    // UML Actor Shape
    function UmlActorShape(this, ...args): void {
      mx.mxShape.call(this, ...args);
    }

    mx.mxUtils.extend(UmlActorShape, mx.mxShape);
    UmlActorShape.prototype.paintBackground = function (c, x, y, w, h): void {
      c.translate(x, y);

      // Head
      c.ellipse(w / 4, 0, w / 2, h / 4);
      c.fillAndStroke();

      c.begin();
      c.moveTo(w / 2, h / 4);
      c.lineTo(w / 2, (2 * h) / 3);

      // Arms
      c.moveTo(w / 2, h / 3);
      c.lineTo(0, h / 3);
      c.moveTo(w / 2, h / 3);
      c.lineTo(w, h / 3);

      // Legs
      c.moveTo(w / 2, (2 * h) / 3);
      c.lineTo(0, h);
      c.moveTo(w / 2, (2 * h) / 3);
      c.lineTo(w, h);
      c.end();

      c.stroke();
    };
    mx.mxCellRenderer.registerShape('umlActor', UmlActorShape);

    // endregion

    // region Scheme
    // Or
    function OrShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(OrShape, mx.mxActor);
    OrShape.prototype.redrawPath = function (c, x, y, w, h): void {
      c.moveTo(0, 0);
      c.quadTo(w, 0, w, h / 2);
      c.quadTo(w, h, 0, h);
      c.close();
      c.end();
    };
    mx.mxCellRenderer.registerShape('or', OrShape);

    // Xor
    function XorShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(XorShape, mx.mxActor);
    XorShape.prototype.redrawPath = function (c, x, y, w, h): void {
      c.moveTo(0, 0);
      c.quadTo(w, 0, w, h / 2);
      c.quadTo(w, h, 0, h);
      c.quadTo(w / 2, h / 2, 0, 0);
      c.close();
      c.end();
    };
    mx.mxCellRenderer.registerShape('xor', XorShape);

    // Data storage
    function DataStorageShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(DataStorageShape, mx.mxActor);
    DataStorageShape.prototype.size = 0.1;
    DataStorageShape.prototype.fixedSize = 20;
    DataStorageShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const fixed = mx.mxUtils.getValue(this.style, 'fixedSize', '0') !== '0';
      const s = fixed
        ? Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.fixedSize))))
        : w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));

      c.moveTo(s, 0);
      c.lineTo(w, 0);
      c.quadTo(w - s * 2, h / 2, w, h);
      c.lineTo(s, h);
      c.quadTo(s - s * 2, h / 2, s, 0);
      c.close();
      c.end();
    };
    mx.mxCellRenderer.registerShape('dataStorage', DataStorageShape);
    // endregion

    // region Arrow
    // Arrow
    function LinkShape(this, ...args): void {
      mx.mxArrowConnector.call(this, ...args);
    }

    mx.mxUtils.extend(LinkShape, mx.mxArrowConnector);
    LinkShape.prototype.defaultWidth = 4;
    LinkShape.prototype.isOpenEnded = function (): boolean {
      return true;
    };
    LinkShape.prototype.getEdgeWidth = function (): number {
      return mx.mxUtils.getNumber(this.style, 'width', this.defaultWidth) + Math.max(0, this.strokewidth - 1);
    };
    LinkShape.prototype.isArrowRounded = function (): boolean {
      return this.isRounded;
    };
    mx.mxCellRenderer.registerShape('link', LinkShape);

    // Arrow
    function FlexArrowShape(this, ...args): void {
      mx.mxArrowConnector.call(this, ...args);
    }

    mx.mxUtils.extend(FlexArrowShape, mx.mxArrowConnector);
    FlexArrowShape.prototype.defaultWidth = 10;
    FlexArrowShape.prototype.defaultArrowWidth = 20;
    FlexArrowShape.prototype.getStartArrowWidth = function (): number {
      return this.getEdgeWidth() + mx.mxUtils.getNumber(this.style, 'startWidth', this.defaultArrowWidth);
    };
    FlexArrowShape.prototype.getEndArrowWidth = function (): number {
      return this.getEdgeWidth() + mx.mxUtils.getNumber(this.style, 'endWidth', this.defaultArrowWidth);
    };
    FlexArrowShape.prototype.getEdgeWidth = function (): number {
      return mx.mxUtils.getNumber(this.style, 'width', this.defaultWidth) + Math.max(0, this.strokewidth - 1);
    };
    mx.mxCellRenderer.registerShape('flexArrow', FlexArrowShape);

    // Arrow
    function SingleArrowShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(SingleArrowShape, mx.mxActor);
    SingleArrowShape.prototype.arrowWidth = 0.3;
    SingleArrowShape.prototype.arrowSize = 0.2;
    SingleArrowShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const aw =
        h * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowWidth', this.arrowWidth))));
      const as = w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowSize', this.arrowSize))));
      const at = (h - aw) / 2;
      const ab = at + aw;

      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, at),
          new mx.mxPoint(w - as, at),
          new mx.mxPoint(w - as, 0),
          new mx.mxPoint(w, h / 2),
          new mx.mxPoint(w - as, h),
          new mx.mxPoint(w - as, ab),
          new mx.mxPoint(0, ab),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('singleArrow', SingleArrowShape);

    // Arrow
    function DoubleArrowShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(DoubleArrowShape, mx.mxActor);
    DoubleArrowShape.prototype.redrawPath = function (c, x, y, w, h): void {
      const aw =
        h *
        Math.max(
          0,
          Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth)))
        );
      const as =
        w *
        Math.max(
          0,
          Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowSize', SingleArrowShape.prototype.arrowSize)))
        );
      const at = (h - aw) / 2;
      const ab = at + aw;

      const arcSize = mx.mxUtils.getValue(this.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(
        c,
        [
          new mx.mxPoint(0, h / 2),
          new mx.mxPoint(as, 0),
          new mx.mxPoint(as, at),
          new mx.mxPoint(w - as, at),
          new mx.mxPoint(w - as, 0),
          new mx.mxPoint(w, h / 2),
          new mx.mxPoint(w - as, h),
          new mx.mxPoint(w - as, ab),
          new mx.mxPoint(as, ab),
          new mx.mxPoint(as, h),
        ],
        this.isRounded,
        arcSize,
        true
      );
      c.end();
    };
    mx.mxCellRenderer.registerShape('doubleArrow', DoubleArrowShape);
    // endregion

    // region OTHERS
    // Table Shape
    function TableShape(this, ...args): void {
      mx.mxSwimlane.call(this, ...args);
    }

    mx.mxUtils.extend(TableShape, mx.mxSwimlane);

    TableShape.prototype.getLabelBounds = function (rect, ...args): mxRectangle {
      const start = this.getTitleSize();

      if (start == 0) {
        return mx.mxShape.prototype.getLabelBounds.apply(this, [rect, ...args]);
      }
      return mx.mxSwimlane.prototype.getLabelBounds.apply(this, [rect, ...args]);
    };
    TableShape.prototype.paintVertexShape = function (c, x, y, w, h): void {
      const start = this.getTitleSize();

      if (start == 0) {
        mx.mxRectangleShape.prototype.paintBackground.apply(this, [c, x, y, w, h]);
      } else {
        mx.mxSwimlane.prototype.paintVertexShape.apply(this, [c, x, y, w, h]);
        c.translate(-x, -y);
      }

      this.paintForeground(c, x, y, w, h);
    };
    TableShape.prototype.paintForeground = function (c, x, y, w, h): void {
      if (this.state != null) {
        let { flipV, flipH } = this;

        if (this.direction == mx.mxConstants.DIRECTION_NORTH || this.direction == mx.mxConstants.DIRECTION_SOUTH) {
          const tmp = flipH;
          flipH = flipV;
          flipV = tmp;
        }

        // Negative transform to avoid save/restore
        c.rotate(-this.getShapeRotation(), flipH, flipV, x + w / 2, y + h / 2);

        const s = this.scale;
        x = this.bounds.x / s;
        y = this.bounds.y / s;
        w = this.bounds.width / s;
        h = this.bounds.height / s;
        this.paintTableForeground(c, x, y, w, h);
      }
    };
    TableShape.prototype.paintTableForeground = function (c, x, y, w, h): void {
      const { graph } = this.state.view;
      const start = graph.getActualStartSize(this.state.cell);
      const rows = graph.model.getChildCells(this.state.cell, true);

      if (rows.length > 0) {
        const rowLines = mx.mxUtils.getValue(this.state.style, 'rowLines', '1') != '0';
        const columnLines = mx.mxUtils.getValue(this.state.style, 'columnLines', '1') != '0';

        // Paints row lines
        if (rowLines) {
          for (let i = 1; i < rows.length; i++) {
            const geo = graph.getCellGeometry(rows[i]);

            if (geo != null) {
              c.begin();
              c.moveTo(x + start.x, y + geo.y);
              c.lineTo(x + w - start.width, y + geo.y);
              c.end();
              c.stroke();
            }
          }
        }

        if (columnLines) {
          const cols = graph.model.getChildCells(rows[0], true);

          // Paints column lines
          for (let i = 1; i < cols.length; i++) {
            const geo = graph.getCellGeometry(cols[i]);

            if (geo != null) {
              c.begin();
              c.moveTo(x + geo.x + start.x, y + start.y);
              c.lineTo(x + geo.x + start.x, y + h - start.height);
              c.end();
              c.stroke();
            }
          }
        }
      }
    };

    // endregion

    // Crossbar shape
    function CrossbarShape(this, ...args): void {
      mx.mxActor.call(this, ...args);
    }

    mx.mxUtils.extend(CrossbarShape, mx.mxActor);
    CrossbarShape.prototype.redrawPath = function (c, x, y, w, h): void {
      c.moveTo(0, 0);
      c.lineTo(0, h);
      c.end();

      c.moveTo(w, 0);
      c.lineTo(w, h);
      c.end();

      c.moveTo(0, h / 2);
      c.lineTo(w, h / 2);
      c.end();
    };
    mx.mxCellRenderer.registerShape('crossbar', CrossbarShape);

    // region Perimeter
    mx.mxPerimeter.LifelinePerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      let { size } = mx.UmlLifeline.prototype;

      if (vertex !== null) {
        size = mx.mxUtils.getValue(vertex.style, 'size', size) * vertex.view.scale;
      }

      let sw = (parseFloat(vertex.style[mx.mxConstants.STYLE_STROKEWIDTH] || 1) * vertex.view.scale) / 2 - 1;

      if (next.x < bounds.getCenterX()) {
        sw += 1;
        sw *= -1;
      }

      return new mx.mxPoint(
        bounds.getCenterX() + sw,
        Math.min(bounds.y + bounds.height, Math.max(bounds.y + size, next.y))
      );
    };
    mx.mxStyleRegistry.putValue('lifelinePerimeter', mx.mxPerimeter.LifelinePerimeter);
    mx.mxPerimeter.OrthogonalPerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      orthogonal = true;

      return mx.mxPerimeter.RectanglePerimeter.apply(this, [bounds, vertex, next, orthogonal]);
    };
    mx.mxStyleRegistry.putValue('orthogonalPerimeter', mx.mxPerimeter.OrthogonalPerimeter);
    mx.mxPerimeter.BackbonePerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      let sw = (parseFloat(vertex.style[mx.mxConstants.STYLE_STROKEWIDTH] || 1) * vertex.view.scale) / 2 - 1;

      if (vertex.style.backboneSize !== null) {
        sw += (parseFloat(vertex.style.backboneSize) * vertex.view.scale) / 2 - 1;
      }

      if (
        vertex.style[mx.mxConstants.STYLE_DIRECTION] === 'south' ||
        vertex.style[mx.mxConstants.STYLE_DIRECTION] === 'north'
      ) {
        if (next.x < bounds.getCenterX()) {
          sw += 1;
          sw *= -1;
        }

        return new mx.mxPoint(bounds.getCenterX() + sw, Math.min(bounds.y + bounds.height, Math.max(bounds.y, next.y)));
      }
      if (next.y < bounds.getCenterY()) {
        sw += 1;
        sw *= -1;
      }

      return new mx.mxPoint(Math.min(bounds.x + bounds.width, Math.max(bounds.x, next.x)), bounds.getCenterY() + sw);
    };
    mx.mxStyleRegistry.putValue('backbonePerimeter', mx.mxPerimeter.BackbonePerimeter);
    // Callout Perimeter
    mx.mxPerimeter.CalloutPerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      return mx.mxPerimeter.RectanglePerimeter(
        mx.mxUtils.getDirectedBounds(
          bounds,
          new mx.mxRectangle(
            0,
            0,
            0,
            Math.max(
              0,
              Math.min(
                bounds.height,
                parseFloat(mx.mxUtils.getValue(vertex.style, 'size', CalloutShape.prototype.size)) * vertex.view.scale
              )
            )
          ),
          vertex.style,
          null,
          null
        ),
        vertex,
        next,
        orthogonal
      );
    };
    mx.mxStyleRegistry.putValue('calloutPerimeter', mx.mxPerimeter.CalloutPerimeter);
    // Parallelogram Perimeter
    mx.mxPerimeter.ParallelogramPerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      const fixed = mx.mxUtils.getValue(vertex.style, 'fixedSize', '0') !== '0';
      let size = (fixed ? ParallelogramShape.prototype.fixedSize : ParallelogramShape.prototype.size) as number;

      if (vertex !== null) {
        size = mx.mxUtils.getValue(vertex.style, 'size', size);
      }

      if (fixed) {
        size *= vertex.view.scale;
      }

      const { x } = bounds;
      const { y } = bounds;
      const w = bounds.width;
      const h = bounds.height;

      const direction =
        vertex !== null
          ? mx.mxUtils.getValue(vertex.style, mx.mxConstants.STYLE_DIRECTION, mx.mxConstants.DIRECTION_EAST)
          : mx.mxConstants.DIRECTION_EAST;
      const vertical = direction === mx.mxConstants.DIRECTION_NORTH || direction === mx.mxConstants.DIRECTION_SOUTH;
      let points;

      if (vertical) {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y),
          new mx.mxPoint(x + w, y + dy),
          new mx.mxPoint(x + w, y + h),
          new mx.mxPoint(x, y + h - dy),
          new mx.mxPoint(x, y),
        ];
      } else {
        const dx = fixed ? Math.max(0, Math.min(w * 0.5, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x + dx, y),
          new mx.mxPoint(x + w, y),
          new mx.mxPoint(x + w - dx, y + h),
          new mx.mxPoint(x, y + h),
          new mx.mxPoint(x + dx, y),
        ];
      }

      const cx = bounds.getCenterX();
      const cy = bounds.getCenterY();

      const p1 = new mx.mxPoint(cx, cy);

      if (orthogonal) {
        if (next.x < x || next.x > x + w) {
          p1.y = next.y;
        } else {
          p1.x = next.x;
        }
      }

      return mx.mxUtils.getPerimeterPoint(points, p1, next);
    };
    mx.mxStyleRegistry.putValue('parallelogramPerimeter', mx.mxPerimeter.ParallelogramPerimeter);
    // Trapezoid Perimeter
    mx.mxPerimeter.TrapezoidPerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      const fixed = mx.mxUtils.getValue(vertex.style, 'fixedSize', '0') !== '0';
      let size = (fixed ? TrapezoidShape.prototype.fixedSize : TrapezoidShape.prototype.size) as number;

      if (vertex !== null) {
        size = mx.mxUtils.getValue(vertex.style, 'size', size);
      }

      if (fixed) {
        size *= vertex.view.scale;
      }

      const { x } = bounds;
      const { y } = bounds;
      const w = bounds.width;
      const h = bounds.height;

      const direction =
        vertex !== null
          ? mx.mxUtils.getValue(vertex.style, mx.mxConstants.STYLE_DIRECTION, mx.mxConstants.DIRECTION_EAST)
          : mx.mxConstants.DIRECTION_EAST;
      let points = [];

      if (direction === mx.mxConstants.DIRECTION_EAST) {
        const dx = fixed ? Math.max(0, Math.min(w * 0.5, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x + dx, y),
          new mx.mxPoint(x + w - dx, y),
          new mx.mxPoint(x + w, y + h),
          new mx.mxPoint(x, y + h),
          new mx.mxPoint(x + dx, y),
        ];
      } else if (direction === mx.mxConstants.DIRECTION_WEST) {
        const dx = fixed ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y),
          new mx.mxPoint(x + w, y),
          new mx.mxPoint(x + w - dx, y + h),
          new mx.mxPoint(x + dx, y + h),
          new mx.mxPoint(x, y),
        ];
      } else if (direction === mx.mxConstants.DIRECTION_NORTH) {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y + dy),
          new mx.mxPoint(x + w, y),
          new mx.mxPoint(x + w, y + h),
          new mx.mxPoint(x, y + h - dy),
          new mx.mxPoint(x, y + dy),
        ];
      } else {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y),
          new mx.mxPoint(x + w, y + dy),
          new mx.mxPoint(x + w, y + h - dy),
          new mx.mxPoint(x, y + h),
          new mx.mxPoint(x, y),
        ];
      }

      const cx = bounds.getCenterX();
      const cy = bounds.getCenterY();

      const p1 = new mx.mxPoint(cx, cy);

      if (orthogonal) {
        if (next.x < x || next.x > x + w) {
          p1.y = next.y;
        } else {
          p1.x = next.x;
        }
      }

      return mx.mxUtils.getPerimeterPoint(points, p1, next);
    };
    mx.mxStyleRegistry.putValue('trapezoidPerimeter', mx.mxPerimeter.TrapezoidPerimeter);
    // Step Perimeter
    mx.mxPerimeter.StepPerimeter = function (bounds, vertex, next, orthogonal): mxPoint {
      const fixed = mx.mxUtils.getValue(vertex.style, 'fixedSize', '0') !== '0';
      let size = (fixed ? StepShape.prototype.fixedSize : StepShape.prototype.size) as number;

      if (vertex !== null) {
        size = mx.mxUtils.getValue(vertex.style, 'size', size);
      }

      if (fixed) {
        size *= vertex.view.scale;
      }

      const { x } = bounds;
      const { y } = bounds;
      const w = bounds.width;
      const h = bounds.height;

      const cx = bounds.getCenterX();
      const cy = bounds.getCenterY();

      const direction =
        vertex !== null
          ? mx.mxUtils.getValue(vertex.style, mx.mxConstants.STYLE_DIRECTION, mx.mxConstants.DIRECTION_EAST)
          : mx.mxConstants.DIRECTION_EAST;
      let points;

      if (direction === mx.mxConstants.DIRECTION_EAST) {
        const dx = fixed ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y),
          new mx.mxPoint(x + w - dx, y),
          new mx.mxPoint(x + w, cy),
          new mx.mxPoint(x + w - dx, y + h),
          new mx.mxPoint(x, y + h),
          new mx.mxPoint(x + dx, cy),
          new mx.mxPoint(x, y),
        ];
      } else if (direction === mx.mxConstants.DIRECTION_WEST) {
        const dx = fixed ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x + dx, y),
          new mx.mxPoint(x + w, y),
          new mx.mxPoint(x + w - dx, cy),
          new mx.mxPoint(x + w, y + h),
          new mx.mxPoint(x + dx, y + h),
          new mx.mxPoint(x, cy),
          new mx.mxPoint(x + dx, y),
        ];
      } else if (direction === mx.mxConstants.DIRECTION_NORTH) {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y + dy),
          new mx.mxPoint(cx, y),
          new mx.mxPoint(x + w, y + dy),
          new mx.mxPoint(x + w, y + h),
          new mx.mxPoint(cx, y + h - dy),
          new mx.mxPoint(x, y + h),
          new mx.mxPoint(x, y + dy),
        ];
      } else {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x, y),
          new mx.mxPoint(cx, y + dy),
          new mx.mxPoint(x + w, y),
          new mx.mxPoint(x + w, y + h - dy),
          new mx.mxPoint(cx, y + h),
          new mx.mxPoint(x, y + h - dy),
          new mx.mxPoint(x, y),
        ];
      }

      const p1 = new mx.mxPoint(cx, cy);

      if (orthogonal) {
        if (next.x < x || next.x > x + w) {
          p1.y = next.y;
        } else {
          p1.x = next.x;
        }
      }

      return mx.mxUtils.getPerimeterPoint(points, p1, next);
    };
    mx.mxStyleRegistry.putValue('stepPerimeter', mx.mxPerimeter.StepPerimeter);
    // Hexagon Perimeter 2 (keep existing one)
    mx.mxPerimeter.HexagonPerimeter2 = function (bounds, vertex, next, orthogonal): mxPoint {
      const fixed = mx.mxUtils.getValue(vertex.style, 'fixedSize', '0') !== '0';
      let size = (fixed ? HexagonShape.prototype.fixedSize : HexagonShape.prototype.size) as number;

      if (vertex !== null) {
        size = mx.mxUtils.getValue(vertex.style, 'size', size);
      }

      if (fixed) {
        size *= vertex.view.scale;
      }

      const { x } = bounds;
      const { y } = bounds;
      const w = bounds.width;
      const h = bounds.height;

      const cx = bounds.getCenterX();
      const cy = bounds.getCenterY();

      const direction =
        vertex !== null
          ? mx.mxUtils.getValue(vertex.style, mx.mxConstants.STYLE_DIRECTION, mx.mxConstants.DIRECTION_EAST)
          : mx.mxConstants.DIRECTION_EAST;
      const vertical = direction === mx.mxConstants.DIRECTION_NORTH || direction === mx.mxConstants.DIRECTION_SOUTH;
      let points;

      if (vertical) {
        const dy = fixed ? Math.max(0, Math.min(h, size)) : h * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(cx, y),
          new mx.mxPoint(x + w, y + dy),
          new mx.mxPoint(x + w, y + h - dy),
          new mx.mxPoint(cx, y + h),
          new mx.mxPoint(x, y + h - dy),
          new mx.mxPoint(x, y + dy),
          new mx.mxPoint(cx, y),
        ];
      } else {
        const dx = fixed ? Math.max(0, Math.min(w, size)) : w * Math.max(0, Math.min(1, size));
        points = [
          new mx.mxPoint(x + dx, y),
          new mx.mxPoint(x + w - dx, y),
          new mx.mxPoint(x + w, cy),
          new mx.mxPoint(x + w - dx, y + h),
          new mx.mxPoint(x + dx, y + h),
          new mx.mxPoint(x, cy),
          new mx.mxPoint(x + dx, y),
        ];
      }

      const p1 = new mx.mxPoint(cx, cy);

      if (orthogonal) {
        if (next.x < x || next.x > x + w) {
          p1.y = next.y;
        } else {
          p1.x = next.x;
        }
      }

      return mx.mxUtils.getPerimeterPoint(points, p1, next);
    };
    mx.mxStyleRegistry.putValue('hexagonPerimeter2', mx.mxPerimeter.HexagonPerimeter2);
    // endregion

    // region mxEdgeStyle
    let isoHVector = new mx.mxPoint(1, 0);
    let isoVVector = new mx.mxPoint(1, 0);

    const alpha1 = mx.mxUtils.toRadians(-30);
    const cos1 = Math.cos(alpha1);
    const sin1 = Math.sin(alpha1);

    const alpha2 = mx.mxUtils.toRadians(-150);
    const cos2 = Math.cos(alpha2);
    const sin2 = Math.sin(alpha2);

    isoVVector = mx.mxUtils.getRotatedPoint(isoVVector, cos2, sin2, null);
    isoHVector = mx.mxUtils.getRotatedPoint(isoHVector, cos1, sin1, null);

    mx.mxEdgeStyle.IsometricConnector = function (
      state: mxCellState,
      source: mxCell,
      target: mxCell,
      points: mxPoint[],
      result: unknown[]
    ): void {
      const { view } = state;
      let pt = points && points.length > 0 ? points[0] : null;
      const pts = state.absolutePoints;
      let p0 = pts[0];
      let pe = pts[pts.length - 1];
      if (pt) {
        pt = view.transformControlPoint(state, pt);
      }

      if (!p0) {
        if (source) {
          p0 = new mx.mxPoint(source.getCenterX(), source.getCenterY());
        }
      }

      if (!pe) {
        if (target) {
          pe = new mx.mxPoint(target.getCenterX(), target.getCenterY());
        }
      }

      const a1 = isoHVector.x;
      const a2 = isoHVector.y;

      const b1 = isoVVector.x;
      const b2 = isoVVector.y;

      const elbow = mx.mxUtils.getValue(state.style, 'elbow', 'horizontal') === 'horizontal';
      if (pe && p0) {
        let last = p0;

        function isoLineTo(x: number, y: number, ignoreFirst: boolean): void {
          const c1 = x - last.x;
          const c2 = y - last.y;

          // Solves for isometric base vectors
          const h = (b2 * c1 - b1 * c2) / (a1 * b2 - a2 * b1);
          const v = (a2 * c1 - a1 * c2) / (a2 * b1 - a1 * b2);

          if (elbow) {
            if (ignoreFirst) {
              last = new mx.mxPoint(last.x + a1 * h, last.y + a2 * h);
              result.push(last);
            }

            last = new mx.mxPoint(last.x + b1 * v, last.y + b2 * v);
            result.push(last);
          } else {
            if (ignoreFirst) {
              last = new mx.mxPoint(last.x + b1 * v, last.y + b2 * v);
              result.push(last);
            }

            last = new mx.mxPoint(last.x + a1 * h, last.y + a2 * h);
            result.push(last);
          }
        }

        if (!pt) {
          pt = new mx.mxPoint(p0.x + (pe.x - p0.x) / 2, p0.y + (pe.y - p0.y) / 2);
        }

        isoLineTo(pt.x, pt.y, true);
        isoLineTo(pe.x, pe.y, false);
      }
    };

    mx.mxStyleRegistry.putValue('isometricEdgeStyle', mx.mxEdgeStyle.IsometricConnector);
    // endregion

    // region Handler
    if (typeof mx.mxVertexHandler !== 'undefined') {
      function createHandle(
        state,
        keys,
        getPositionFn,
        setPositionFn?,
        ignoreGrid?,
        redrawEdges?,
        executeFn?
      ): mxHandle {
        const handle = new mx.mxHandle(state, 'grab', mx.mxVertexHandler.prototype.secondaryHandleImage, null);

        handle.execute = function (me): void {
          for (let i = 0; i < keys.length; i++) {
            this.copyStyle(keys[i]);
          }

          if (executeFn) {
            executeFn(me);
          }
        };

        handle.getPosition = getPositionFn;
        handle.setPosition = setPositionFn;
        handle.ignoreGrid = ignoreGrid !== null ? ignoreGrid : true;

        // Overridden to update connected edges
        if (redrawEdges) {
          const { positionChanged } = handle;

          handle.positionChanged = function (): void {
            positionChanged.apply(this);

            // Redraws connected edges TODO: Include child edges
            state.view.invalidate(this.state.cell);
            state.view.validate();
          };
        }

        return handle;
      }

      // region Handler Func
      function createArcHandle(this, state, yOffset?): mxHandle {
        return createHandle(
          state,
          [mx.mxConstants.STYLE_ARCSIZE],
          function (bounds) {
            const tmp = yOffset !== null ? yOffset : bounds.height / 8;

            if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) === '1') {
              const arcSize =
                mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ARCSIZE, mx.mxConstants.LINE_ARCSIZE) / 2;

              return new mx.mxPoint(bounds.x + bounds.width - Math.min(bounds.width / 2, arcSize), bounds.y + tmp);
            }
            const arcSize =
              Math.max(
                0,
                parseFloat(
                  mx.mxUtils.getValue(
                    state.style,
                    mx.mxConstants.STYLE_ARCSIZE,
                    mx.mxConstants.RECTANGLE_ROUNDING_FACTOR * 100
                  )
                )
              ) / 100;

            return new mx.mxPoint(
              bounds.x +
                bounds.width -
                Math.min(
                  Math.max(bounds.width / 2, bounds.height / 2),
                  Math.min(bounds.width, bounds.height) * arcSize
                ),
              bounds.y + tmp
            );
          },
          function (this, bounds, pt) {
            if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ABSOLUTE_ARCSIZE, 0) === '1') {
              this.state.style[mx.mxConstants.STYLE_ARCSIZE] = Math.round(
                Math.max(0, Math.min(bounds.width, (bounds.x + bounds.width - pt.x) * 2))
              );
            } else {
              const f = Math.min(
                50,
                Math.max(0, ((bounds.width - pt.x + bounds.x) * 100) / Math.min(bounds.width, bounds.height))
              );
              this.state.style[mx.mxConstants.STYLE_ARCSIZE] = Math.round(f);
            }
          }
        );
      }

      function createArcHandleFunction() {
        return function (state) {
          const handles = [];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state, null));
          }

          return handles;
        };
      }

      function createTrapezoidHandleFunction(max, defaultValue, fixedDefaultValue) {
        max = max !== null ? max : 0.5;

        return function (state) {
          const handles = [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const fixed =
                  fixedDefaultValue !== null ? mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0' : null;
                const size = Math.max(
                  0,
                  parseFloat(mx.mxUtils.getValue(this.state.style, 'size', fixed ? fixedDefaultValue : defaultValue))
                );

                return new mx.mxPoint(
                  bounds.x + Math.min(bounds.width * 0.75 * max, size * (fixed ? 0.75 : bounds.width * 0.75)),
                  bounds.y + bounds.height / 4
                );
              },
              function (this, bounds, pt) {
                const fixed =
                  fixedDefaultValue !== null ? mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0' : null;
                const size = fixed
                  ? pt.x - bounds.x
                  : Math.max(0, Math.min(max, ((pt.x - bounds.x) / bounds.width) * 0.75));

                this.state.style.size = size;
              },
              false,
              true
            ),
          ];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        };
      }

      // eslint-disable-next-line no-inner-declarations
      function createDisplayHandleFunction(defaultValue, allowArcHandle, max?, redrawEdges?, fixedDefaultValue?) {
        max = max !== null ? max : 0.5;

        return function (state) {
          const handles = [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const fixed =
                  fixedDefaultValue !== null ? mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0' : null;
                const size = parseFloat(
                  mx.mxUtils.getValue(this.state.style, 'size', fixed ? fixedDefaultValue : defaultValue)
                );

                return new mx.mxPoint(
                  bounds.x + Math.max(0, Math.min(bounds.width * 0.5, size * (fixed ? 1 : bounds.width))),
                  bounds.getCenterY()
                );
              },
              function (this, bounds, pt) {
                const fixed =
                  fixedDefaultValue !== null ? mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0' : null;
                const size = fixed ? pt.x - bounds.x : Math.max(0, Math.min(max, (pt.x - bounds.x) / bounds.width));

                this.state.style.size = size;
              },
              false,
              redrawEdges
            ),
          ];

          if (allowArcHandle && mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        };
      }

      function createCubeHandleFunction(factor, defaultValue, allowArcHandle) {
        return function (state) {
          const handles = [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size =
                  Math.max(
                    0,
                    Math.min(
                      bounds.width,
                      Math.min(bounds.height, parseFloat(mx.mxUtils.getValue(this.state.style, 'size', defaultValue)))
                    )
                  ) * factor;

                return new mx.mxPoint(bounds.x + size, bounds.y + size);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.round(
                  Math.max(
                    0,
                    Math.min(Math.min(bounds.width, pt.x - bounds.x), Math.min(bounds.height, pt.y - bounds.y))
                  ) / factor
                );
              },
              false
            ),
          ];

          if (allowArcHandle && mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        };
      }

      function createCylinderHandleFunction(defaultValue) {
        return function (state) {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(bounds.height * 0.5, parseFloat(mx.mxUtils.getValue(this.state.style, 'size', defaultValue)))
                );

                return new mx.mxPoint(bounds.x, bounds.y + size);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.max(0, pt.y - bounds.y);
              },
              true
            ),
          ];
        };
      }

      function createArrowHandleFunction(maxSize) {
        return function (state) {
          return [
            createHandle(
              state,
              ['arrowWidth', 'arrowSize'],
              function (this, bounds) {
                const aw = Math.max(
                  0,
                  Math.min(
                    1,
                    mx.mxUtils.getValue(this.state.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth)
                  )
                );
                const as = Math.max(
                  0,
                  Math.min(
                    maxSize,
                    mx.mxUtils.getValue(this.state.style, 'arrowSize', SingleArrowShape.prototype.arrowSize)
                  )
                );

                return new mx.mxPoint(bounds.x + (1 - as) * bounds.width, bounds.y + ((1 - aw) * bounds.height) / 2);
              },
              function (this, bounds, pt) {
                this.state.style.arrowWidth = Math.max(
                  0,
                  Math.min(1, (Math.abs(bounds.y + bounds.height / 2 - pt.y) / bounds.height) * 2)
                );
                this.state.style.arrowSize = Math.max(
                  0,
                  Math.min(maxSize, (bounds.x + bounds.width - pt.x) / bounds.width)
                );
              }
            ),
          ];
        };
      }

      function createEdgeHandle(state, keys, start, getPosition, setPosition): mxHandle {
        return createHandle(
          state,
          keys,
          function (this) {
            const pts = state.absolutePoints;
            const n = pts.length - 1;

            const tr = state.view.translate;
            const s = state.view.scale;

            const p0 = start ? pts[0] : pts[n];
            const p1 = start ? pts[1] : pts[n - 1];
            const dx = start ? p1.x - p0.x : p1.x - p0.x;
            const dy = start ? p1.y - p0.y : p1.y - p0.y;

            const dist = Math.sqrt(dx * dx + dy * dy);

            const pt = getPosition.call(this, dist, dx / dist, dy / dist, p0, p1);

            return new mx.mxPoint(pt.x / s - tr.x, pt.y / s - tr.y);
          },
          function (this, bounds, pt, me) {
            const pts = state.absolutePoints;
            const n = pts.length - 1;

            const tr = state.view.translate;
            const s = state.view.scale;

            const p0 = start ? pts[0] : pts[n];
            const p1 = start ? pts[1] : pts[n - 1];
            const dx = start ? p1.x - p0.x : p1.x - p0.x;
            const dy = start ? p1.y - p0.y : p1.y - p0.y;

            const dist = Math.sqrt(dx * dx + dy * dy);
            pt.x = (pt.x + tr.x) * s;
            pt.y = (pt.y + tr.y) * s;
            setPosition.call(this, dist, dx / dist, dy / dist, p0, p1, pt, me);
          }
        );
      }

      function createEdgeWidthHandle(state, start, spacing): mxHandle {
        return createEdgeHandle(
          state,
          ['width'],
          start,
          function (dist, nx, ny, p0) {
            const w = state.shape.getEdgeWidth() * state.view.scale + spacing;

            return new mx.mxPoint(p0.x + (nx * dist) / 4 + (ny * w) / 2, p0.y + (ny * dist) / 4 - (nx * w) / 2);
          },
          function (dist, nx, ny, p0, p1, pt) {
            const w = Math.sqrt(mx.mxUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
            state.style.width = Math.round(w * 2) / state.view.scale - spacing;
          }
        );
      }

      // endregion

      const handleFactory = {
        rectangle: createArcHandleFunction(),
        parallelogram: createTrapezoidHandleFunction(
          1,
          ParallelogramShape.prototype.size,
          ParallelogramShape.prototype.fixedSize
        ),
        trapezoid: createTrapezoidHandleFunction(
          0.5,
          TrapezoidShape.prototype.size,
          TrapezoidShape.prototype.fixedSize
        ),
        step: createDisplayHandleFunction(StepShape.prototype.size, true, null, true, StepShape.prototype.fixedSize),
        process(this, state): mxHandle[] {
          const handles = [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const fixed = mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0';
                const size = parseFloat(mx.mxUtils.getValue(this.state.style, 'size', ProcessShape.prototype.size));

                return fixed
                  ? new mx.mxPoint(bounds.x + size, bounds.y + bounds.height / 4)
                  : new mx.mxPoint(bounds.x + bounds.width * size, bounds.y + bounds.height / 4);
              },
              function (this, bounds, pt) {
                const fixed = mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0';
                const size = fixed
                  ? Math.max(0, Math.min(bounds.width * 0.5, pt.x - bounds.x))
                  : Math.max(0, Math.min(0.5, (pt.x - bounds.x) / bounds.width));
                this.state.style.size = size;
              },
              false
            ),
          ];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        },
        tape(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(1, parseFloat(mx.mxUtils.getValue(this.state.style, 'size', TapeShape.prototype.size)))
                );

                return new mx.mxPoint(bounds.getCenterX(), bounds.y + (size * bounds.height) / 2);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.max(0, Math.min(1, ((pt.y - bounds.y) / bounds.height) * 2));
              },
              false
            ),
          ];
        },
        cube: createCubeHandleFunction(1, CubeShape.prototype.size, false),
        triangle: createArcHandleFunction(),
        rhombus: createArcHandleFunction(),
        hexagon: createDisplayHandleFunction(
          HexagonShape.prototype.size,
          true,
          0.5,
          true,
          HexagonShape.prototype.fixedSize
        ),
        manualInput(state): mxHandle[] {
          const handles = [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(
                    bounds.height,
                    mx.mxUtils.getValue(this.state.style, 'size', ManualInputShape.prototype.size)
                  )
                );

                return new mx.mxPoint(bounds.x + bounds.width / 4, bounds.y + (size * 3) / 4);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.round(Math.max(0, Math.min(bounds.height, ((pt.y - bounds.y) * 4) / 3)));
              },
              false
            ),
          ];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        },
        loopLimit: createCubeHandleFunction(0.5, LoopLimitShape.prototype.size, true),
        offPageConnector(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(
                    1,
                    parseFloat(mx.mxUtils.getValue(this.state.style, 'size', OffPageConnectorShape.prototype.size))
                  )
                );

                return new mx.mxPoint(bounds.getCenterX(), bounds.y + (1 - size) * bounds.height);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
              },
              false
            ),
          ];
        },
        display: createDisplayHandleFunction(DisplayShape.prototype.size, false),
        cylinder3: createCylinderHandleFunction(CylinderShape3.prototype.size),
        internalStorage(state): mxHandle[] {
          const handles = [
            createHandle(
              state,
              ['dx', 'dy'],
              function (this, bounds) {
                const dx = Math.max(
                  0,
                  Math.min(bounds.width, mx.mxUtils.getValue(this.state.style, 'dx', InternalStorageShape.prototype.dx))
                );
                const dy = Math.max(
                  0,
                  Math.min(
                    bounds.height,
                    mx.mxUtils.getValue(this.state.style, 'dy', InternalStorageShape.prototype.dy)
                  )
                );

                return new mx.mxPoint(bounds.x + dx, bounds.y + dy);
              },
              function (this, bounds, pt) {
                this.state.style.dx = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
                this.state.style.dy = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
              },
              false
            ),
          ];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        },
        document(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(1, parseFloat(mx.mxUtils.getValue(this.state.style, 'size', DocumentShape.prototype.size)))
                );

                return new mx.mxPoint(bounds.x + (3 * bounds.width) / 4, bounds.y + (1 - size) * bounds.height);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.max(0, Math.min(1, (bounds.y + bounds.height - pt.y) / bounds.height));
              },
              false
            ),
          ];
        },
        note(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(
                    bounds.width,
                    Math.min(
                      bounds.height,
                      parseFloat(mx.mxUtils.getValue(this.state.style, 'size', NoteShape.prototype.size))
                    )
                  )
                );

                return new mx.mxPoint(bounds.x + bounds.width - size, bounds.y + size);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.round(
                  Math.max(
                    0,
                    Math.min(
                      Math.min(bounds.width, bounds.x + bounds.width - pt.x),
                      Math.min(bounds.height, pt.y - bounds.y)
                    )
                  )
                );
              }
            ),
          ];
        },
        card: createCubeHandleFunction(0.5, CardShape.prototype.size, true),
        callout(state): mxHandle[] {
          const handles = [
            createHandle(
              state,
              ['size', 'position'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(bounds.height, mx.mxUtils.getValue(this.state.style, 'size', CalloutShape.prototype.size))
                );
                const position = Math.max(
                  0,
                  Math.min(1, mx.mxUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position))
                );

                return new mx.mxPoint(bounds.x + position * bounds.width, bounds.y + bounds.height - size);
              },
              function (this, bounds, pt) {
                this.state.style.size = Math.round(
                  Math.max(0, Math.min(bounds.height, bounds.y + bounds.height - pt.y))
                );
                this.state.style.position =
                  Math.round(Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width)) * 100) / 100;
              },
              false
            ),
            createHandle(
              state,
              ['position2'],
              function (this, bounds) {
                const position2 = Math.max(
                  0,
                  Math.min(1, mx.mxUtils.getValue(this.state.style, 'position2', CalloutShape.prototype.position2))
                );

                return new mx.mxPoint(bounds.x + position2 * bounds.width, bounds.y + bounds.height);
              },
              function (this, bounds, pt) {
                this.state.style.position2 =
                  Math.round(Math.max(0, Math.min(1, (pt.x - bounds.x) / bounds.width)) * 100) / 100;
              },
              false
            ),
            createHandle(
              state,
              ['base'],
              function (this, bounds) {
                const size = Math.max(
                  0,
                  Math.min(bounds.height, mx.mxUtils.getValue(this.state.style, 'size', CalloutShape.prototype.size))
                );
                const position = Math.max(
                  0,
                  Math.min(1, mx.mxUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position))
                );
                const base = Math.max(
                  0,
                  Math.min(bounds.width, mx.mxUtils.getValue(this.state.style, 'base', CalloutShape.prototype.base))
                );

                return new mx.mxPoint(
                  bounds.x + Math.min(bounds.width, position * bounds.width + base),
                  bounds.y + bounds.height - size
                );
              },
              function (this, bounds, pt) {
                const position = Math.max(
                  0,
                  Math.min(1, mx.mxUtils.getValue(this.state.style, 'position', CalloutShape.prototype.position))
                );

                this.state.style.base = Math.round(
                  Math.max(0, Math.min(bounds.width, pt.x - bounds.x - position * bounds.width))
                );
              },
              false
            ),
          ];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, false)) {
            handles.push(createArcHandle(state));
          }

          return handles;
        },
        dataStorage(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const fixed = mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0';
                const size = parseFloat(
                  mx.mxUtils.getValue(
                    this.state.style,
                    'size',
                    fixed ? DataStorageShape.prototype.fixedSize : DataStorageShape.prototype.size
                  )
                );

                return new mx.mxPoint(bounds.x + bounds.width - size * (fixed ? 1 : bounds.width), bounds.getCenterY());
              },
              function (this, bounds, pt) {
                const fixed = mx.mxUtils.getValue(this.state.style, 'fixedSize', '0') !== '0';
                const size = fixed
                  ? Math.max(0, Math.min(bounds.width, bounds.x + bounds.width - pt.x))
                  : Math.max(0, Math.min(1, (bounds.x + bounds.width - pt.x) / bounds.width));

                this.state.style.size = size;
              },
              false
            ),
          ];
        },
        link(state): mxHandle[] {
          const spacing = 10;

          return [createEdgeWidthHandle(state, true, spacing), createEdgeWidthHandle(state, false, spacing)];
        },
        flexArrow(state): mxHandle[] {
          // Do not use state.shape.startSize/endSize since it is cached
          const tol = state.view.graph.gridSize / state.view.scale;
          const handles = [];

          if (
            mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_STARTARROW, mx.mxConstants.NONE) !==
            mx.mxConstants.NONE
          ) {
            handles.push(
              createEdgeHandle(
                state,
                ['width', mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.STYLE_ENDSIZE],
                true,
                function (dist, nx, ny, p0) {
                  const w = (state.shape.getEdgeWidth() - state.shape.strokewidth) * state.view.scale;
                  const l =
                    mx.mxUtils.getNumber(state.style, mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.ARROW_SIZE / 5) *
                    3 *
                    state.view.scale;

                  return new mx.mxPoint(
                    p0.x + nx * (l + state.shape.strokewidth * state.view.scale) + (ny * w) / 2,
                    p0.y + ny * (l + state.shape.strokewidth * state.view.scale) - (nx * w) / 2
                  );
                },
                function (dist, nx, ny, p0, p1, pt, me) {
                  const w = Math.sqrt(mx.mxUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
                  const l = mx.mxUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);

                  state.style[mx.mxConstants.STYLE_STARTSIZE] =
                    Math.round(((l - state.shape.strokewidth) * 100) / 3) / 100 / state.view.scale;
                  state.style.width = Math.round(w * 2) / state.view.scale;

                  // Applies to opposite side
                  if (mx.mxEvent.isControlDown(me.getEvent())) {
                    state.style[mx.mxConstants.STYLE_ENDSIZE] = state.style[mx.mxConstants.STYLE_STARTSIZE];
                  }

                  // Snaps to end geometry
                  if (!mx.mxEvent.isAltDown(me.getEvent())) {
                    if (
                      Math.abs(
                        parseFloat(state.style[mx.mxConstants.STYLE_STARTSIZE]) -
                          parseFloat(state.style[mx.mxConstants.STYLE_ENDSIZE])
                      ) <
                      tol / 6
                    ) {
                      state.style[mx.mxConstants.STYLE_STARTSIZE] = state.style[mx.mxConstants.STYLE_ENDSIZE];
                    }
                  }
                }
              )
            );

            handles.push(
              createEdgeHandle(
                state,
                ['startWidth', 'endWidth', mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.STYLE_ENDSIZE],
                true,
                function (dist, nx, ny, p0) {
                  const w = (state.shape.getStartArrowWidth() - state.shape.strokewidth) * state.view.scale;
                  const l =
                    mx.mxUtils.getNumber(state.style, mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.ARROW_SIZE / 5) *
                    3 *
                    state.view.scale;

                  return new mx.mxPoint(
                    p0.x + nx * (l + state.shape.strokewidth * state.view.scale) + (ny * w) / 2,
                    p0.y + ny * (l + state.shape.strokewidth * state.view.scale) - (nx * w) / 2
                  );
                },
                function (dist, nx, ny, p0, p1, pt, me) {
                  const w = Math.sqrt(mx.mxUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
                  const l = mx.mxUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);

                  state.style[mx.mxConstants.STYLE_STARTSIZE] =
                    Math.round(((l - state.shape.strokewidth) * 100) / 3) / 100 / state.view.scale;
                  state.style.startWidth =
                    Math.max(0, Math.round(w * 2) - state.shape.getEdgeWidth()) / state.view.scale;

                  // Applies to opposite side
                  if (mx.mxEvent.isControlDown(me.getEvent())) {
                    state.style[mx.mxConstants.STYLE_ENDSIZE] = state.style[mx.mxConstants.STYLE_STARTSIZE];
                    state.style.endWidth = state.style.startWidth;
                  }

                  // Snaps to endWidth
                  if (!mx.mxEvent.isAltDown(me.getEvent())) {
                    if (
                      Math.abs(
                        parseFloat(state.style[mx.mxConstants.STYLE_STARTSIZE]) -
                          parseFloat(state.style[mx.mxConstants.STYLE_ENDSIZE])
                      ) <
                      tol / 6
                    ) {
                      state.style[mx.mxConstants.STYLE_STARTSIZE] = state.style[mx.mxConstants.STYLE_ENDSIZE];
                    }

                    if (Math.abs(parseFloat(state.style.startWidth) - parseFloat(state.style.endWidth)) < tol) {
                      state.style.startWidth = state.style.endWidth;
                    }
                  }
                }
              )
            );
          }

          if (
            mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ENDARROW, mx.mxConstants.NONE) !== mx.mxConstants.NONE
          ) {
            handles.push(
              createEdgeHandle(
                state,
                ['width', mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.STYLE_ENDSIZE],
                false,
                function (dist, nx, ny, p0) {
                  const w = (state.shape.getEdgeWidth() - state.shape.strokewidth) * state.view.scale;
                  const l =
                    mx.mxUtils.getNumber(state.style, mx.mxConstants.STYLE_ENDSIZE, mx.mxConstants.ARROW_SIZE / 5) *
                    3 *
                    state.view.scale;

                  return new mx.mxPoint(
                    p0.x + nx * (l + state.shape.strokewidth * state.view.scale) - (ny * w) / 2,
                    p0.y + ny * (l + state.shape.strokewidth * state.view.scale) + (nx * w) / 2
                  );
                },
                function (dist, nx, ny, p0, p1, pt, me) {
                  const w = Math.sqrt(mx.mxUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
                  const l = mx.mxUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);

                  state.style[mx.mxConstants.STYLE_ENDSIZE] =
                    Math.round(((l - state.shape.strokewidth) * 100) / 3) / 100 / state.view.scale;
                  state.style.width = Math.round(w * 2) / state.view.scale;

                  // Applies to opposite side
                  if (mx.mxEvent.isControlDown(me.getEvent())) {
                    state.style[mx.mxConstants.STYLE_STARTSIZE] = state.style[mx.mxConstants.STYLE_ENDSIZE];
                  }

                  // Snaps to start geometry
                  if (!mx.mxEvent.isAltDown(me.getEvent())) {
                    if (
                      Math.abs(
                        parseFloat(state.style[mx.mxConstants.STYLE_ENDSIZE]) -
                          parseFloat(state.style[mx.mxConstants.STYLE_STARTSIZE])
                      ) <
                      tol / 6
                    ) {
                      state.style[mx.mxConstants.STYLE_ENDSIZE] = state.style[mx.mxConstants.STYLE_STARTSIZE];
                    }
                  }
                }
              )
            );

            handles.push(
              createEdgeHandle(
                state,
                ['startWidth', 'endWidth', mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.STYLE_ENDSIZE],
                false,
                function (dist, nx, ny, p0) {
                  const w = (state.shape.getEndArrowWidth() - state.shape.strokewidth) * state.view.scale;
                  const l =
                    mx.mxUtils.getNumber(state.style, mx.mxConstants.STYLE_ENDSIZE, mx.mxConstants.ARROW_SIZE / 5) *
                    3 *
                    state.view.scale;

                  return new mx.mxPoint(
                    p0.x + nx * (l + state.shape.strokewidth * state.view.scale) - (ny * w) / 2,
                    p0.y + ny * (l + state.shape.strokewidth * state.view.scale) + (nx * w) / 2
                  );
                },
                function (dist, nx, ny, p0, p1, pt, me) {
                  const w = Math.sqrt(mx.mxUtils.ptSegDistSq(p0.x, p0.y, p1.x, p1.y, pt.x, pt.y));
                  const l = mx.mxUtils.ptLineDist(p0.x, p0.y, p0.x + ny, p0.y - nx, pt.x, pt.y);

                  state.style[mx.mxConstants.STYLE_ENDSIZE] =
                    Math.round(((l - state.shape.strokewidth) * 100) / 3) / 100 / state.view.scale;
                  state.style.endWidth = Math.max(0, Math.round(w * 2) - state.shape.getEdgeWidth()) / state.view.scale;

                  // Applies to opposite side
                  if (mx.mxEvent.isControlDown(me.getEvent())) {
                    state.style[mx.mxConstants.STYLE_STARTSIZE] = state.style[mx.mxConstants.STYLE_ENDSIZE];
                    state.style.startWidth = state.style.endWidth;
                  }

                  // Snaps to start geometry
                  if (!mx.mxEvent.isAltDown(me.getEvent())) {
                    if (
                      Math.abs(
                        parseFloat(state.style[mx.mxConstants.STYLE_ENDSIZE]) -
                          parseFloat(state.style[mx.mxConstants.STYLE_STARTSIZE])
                      ) <
                      tol / 6
                    ) {
                      state.style[mx.mxConstants.STYLE_ENDSIZE] = state.style[mx.mxConstants.STYLE_STARTSIZE];
                    }

                    if (Math.abs(parseFloat(state.style.endWidth) - parseFloat(state.style.startWidth)) < tol) {
                      state.style.endWidth = state.style.startWidth;
                    }
                  }
                }
              )
            );
          }

          return handles;
        },
        singleArrow: createArrowHandleFunction(1),
        doubleArrow: createArrowHandleFunction(0.5),

        // cylinder2: createCylinderHandleFunction(CylinderShape.prototype.size),
        // folder(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['tabWidth', 'tabHeight'],
        //       function (this, bounds) {
        //         let tw = Math.max(
        //           0,
        //           Math.min(
        //             bounds.width,
        //             mx.mxUtils.getValue(this.state.style, 'tabWidth', FolderShape.prototype.tabWidth)
        //           )
        //         );
        //         const th = Math.max(
        //           0,
        //           Math.min(
        //             bounds.height,
        //             mx.mxUtils.getValue(this.state.style, 'tabHeight', FolderShape.prototype.tabHeight)
        //           )
        //         );
        //
        //         if (
        //           mx.mxUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) ===
        //           mx.mxConstants.ALIGN_RIGHT
        //         ) {
        //           tw = bounds.width - tw;
        //         }
        //
        //         return new mx.mxPoint(bounds.x + tw, bounds.y + th);
        //       },
        //       function (this, bounds, pt) {
        //         let tw = Math.max(0, Math.min(bounds.width, pt.x - bounds.x));
        //
        //         if (
        //           mx.mxUtils.getValue(this.state.style, 'tabPosition', FolderShape.prototype.tabPosition) ===
        //           mx.mxConstants.ALIGN_RIGHT
        //         ) {
        //           tw = bounds.width - tw;
        //         }
        //
        //         this.state.style.tabWidth = Math.round(tw);
        //         this.state.style.tabHeight = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
        //       },
        //       false
        //     ),
        //   ];
        // },
        swimlane(state): mxHandle[] {
          const handles = [];

          if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_ROUNDED, null)) {
            const size = parseFloat(
              mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.DEFAULT_STARTSIZE)
            );
            handles.push(createArcHandle(state, size / 2));
          }

          // Start size handle must be last item in handles for hover to work in tables (see mouse event handler in Graph)
          handles.push(
            createHandle(
              state,
              [mx.mxConstants.STYLE_STARTSIZE],
              function (bounds) {
                const size = parseFloat(
                  mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_STARTSIZE, mx.mxConstants.DEFAULT_STARTSIZE)
                );

                if (mx.mxUtils.getValue(state.style, mx.mxConstants.STYLE_HORIZONTAL, 1) === 1) {
                  return new mx.mxPoint(bounds.getCenterX(), bounds.y + Math.max(0, Math.min(bounds.height, size)));
                }
                return new mx.mxPoint(bounds.x + Math.max(0, Math.min(bounds.width, size)), bounds.getCenterY());
              },
              function (this, bounds, pt) {
                state.style[mx.mxConstants.STYLE_STARTSIZE] =
                  mx.mxUtils.getValue(this.state.style, mx.mxConstants.STYLE_HORIZONTAL, 1) === 1
                    ? Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)))
                    : Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
              },
              false,
              null,
              function (me) {
                if (mx.mxEvent.isControlDown(me.getEvent())) {
                  const { graph } = state.view;

                  if (graph.isTableRow(state.cell) || graph.isTableCell(state.cell)) {
                    const dir = graph.getSwimlaneDirection(state.style);
                    const parent = graph.model.getParent(state.cell);
                    const cells = graph.model.getChildCells(parent, true);
                    const temp = [];

                    for (let i = 0; i < cells.length; i++) {
                      // Finds siblings with the same direction and to set start size
                      if (
                        cells[i] !== state.cell &&
                        graph.isSwimlane(cells[i]) &&
                        graph.getSwimlaneDirection(graph.getCurrentCellStyle(cells[i])) === dir
                      ) {
                        temp.push(cells[i]);
                      }
                    }

                    graph.setCellStyles(
                      mx.mxConstants.STYLE_STARTSIZE,
                      state.style[mx.mxConstants.STYLE_STARTSIZE],
                      temp
                    );
                  }
                }
              }
            )
          );

          return handles;
        },
        label: createArcHandleFunction(),
        // ext: createArcHandleFunction(),
        // umlLifeline(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['size'],
        //       function (this, bounds) {
        //         const size = Math.max(
        //           0,
        //           Math.min(
        //             bounds.height,
        //             parseFloat(mx.mxUtils.getValue(this.state.style, 'size', UmlLifeline.prototype.size))
        //           )
        //         );
        //
        //         return new mx.mxPoint(bounds.getCenterX(), bounds.y + size);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.size = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
        //       },
        //       false
        //     ),
        //   ];
        // },
        // umlFrame(this, state): mxHandle[] {
        //   const handles = [
        //     createHandle(
        //       state,
        //       ['width', 'height'],
        //       function (this, bounds) {
        //         const w0 = Math.max(
        //           UmlFrame.prototype.corner,
        //           Math.min(bounds.width, mx.mxUtils.getValue(this.state.style, 'width', UmlFrame.prototype.width))
        //         );
        //         const h0 = Math.max(
        //           UmlFrame.prototype.corner * 1.5,
        //           Math.min(bounds.height, mx.mxUtils.getValue(this.state.style, 'height', UmlFrame.prototype.height))
        //         );
        //
        //         return new mx.mxPoint(bounds.x + w0, bounds.y + h0);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.width = Math.round(
        //           Math.max(UmlFrame.prototype.corner, Math.min(bounds.width, pt.x - bounds.x))
        //         );
        //         this.state.style.height = Math.round(
        //           Math.max(UmlFrame.prototype.corner * 1.5, Math.min(bounds.height, pt.y - bounds.y))
        //         );
        //       },
        //       false
        //     ),
        //   ];
        //
        //   return handles;
        // },
        cross(state): mxHandle[] {
          return [
            createHandle(
              state,
              ['size'],
              function (this, bounds) {
                const m = Math.min(bounds.width, bounds.height);
                const size =
                  (Math.max(0, Math.min(1, mx.mxUtils.getValue(this.state.style, 'size', CrossShape.prototype.size))) *
                    m) /
                  2;

                return new mx.mxPoint(bounds.getCenterX() - size, bounds.getCenterY() - size);
              },
              function (this, bounds, pt) {
                const m = Math.min(bounds.width, bounds.height);
                this.state.style.size = Math.max(
                  0,
                  Math.min(
                    1,
                    Math.min(
                      (Math.max(0, bounds.getCenterY() - pt.y) / m) * 2,
                      (Math.max(0, bounds.getCenterX() - pt.x) / m) * 2
                    )
                  )
                );
              }
            ),
          ];
        },
        // note2(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['size'],
        //       function (this, bounds) {
        //         const size = Math.max(
        //           0,
        //           Math.min(
        //             bounds.width,
        //             Math.min(
        //               bounds.height,
        //               parseFloat(mx.mxUtils.getValue(this.state.style, 'size', NoteShape2.prototype.size))
        //             )
        //           )
        //         );
        //
        //         return new mx.mxPoint(bounds.x + bounds.width - size, bounds.y + size);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.size = Math.round(
        //           Math.max(
        //             0,
        //             Math.min(
        //               Math.min(bounds.width, bounds.x + bounds.width - pt.x),
        //               Math.min(bounds.height, pt.y - bounds.y)
        //             )
        //           )
        //         );
        //       }
        //     ),
        //   ];
        // },
        // module(state): mxHandle[] {
        //   const handles = [
        //     createHandle(
        //       state,
        //       ['jettyWidth', 'jettyHeight'],
        //       function (this, bounds) {
        //         const dx = Math.max(
        //           0,
        //           Math.min(
        //             bounds.width,
        //             mx.mxUtils.getValue(this.state.style, 'jettyWidth', ModuleShape.prototype.jettyWidth)
        //           )
        //         );
        //         const dy = Math.max(
        //           0,
        //           Math.min(
        //             bounds.height,
        //             mx.mxUtils.getValue(this.state.style, 'jettyHeight', ModuleShape.prototype.jettyHeight)
        //           )
        //         );
        //
        //         return new mx.mxPoint(bounds.x + dx / 2, bounds.y + dy * 2);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.jettyWidth = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)) * 2);
        //         this.state.style.jettyHeight = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)) / 2);
        //       }
        //     ),
        //   ];
        //
        //   return handles;
        // },
        // corner(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['dx', 'dy'],
        //       function (this, bounds) {
        //         const dx = Math.max(
        //           0,
        //           Math.min(bounds.width, mx.mxUtils.getValue(this.state.style, 'dx', CornerShape.prototype.dx))
        //         );
        //         const dy = Math.max(
        //           0,
        //           Math.min(bounds.height, mx.mxUtils.getValue(this.state.style, 'dy', CornerShape.prototype.dy))
        //         );
        //
        //         return new mx.mxPoint(bounds.x + dx, bounds.y + dy);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.dx = Math.round(Math.max(0, Math.min(bounds.width, pt.x - bounds.x)));
        //         this.state.style.dy = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
        //       },
        //       false
        //     ),
        //   ];
        // },
        // tee(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['dx', 'dy'],
        //       function (this, bounds) {
        //         const dx = Math.max(
        //           0,
        //           Math.min(bounds.width, mx.mxUtils.getValue(this.state.style, 'dx', TeeShape.prototype.dx))
        //         );
        //         const dy = Math.max(
        //           0,
        //           Math.min(bounds.height, mx.mxUtils.getValue(this.state.style, 'dy', TeeShape.prototype.dy))
        //         );
        //
        //         return new mx.mxPoint(bounds.x + (bounds.width + dx) / 2, bounds.y + dy);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.dx = Math.round(
        //           Math.max(0, Math.min(bounds.width / 2, pt.x - bounds.x - bounds.width / 2) * 2)
        //         );
        //         this.state.style.dy = Math.round(Math.max(0, Math.min(bounds.height, pt.y - bounds.y)));
        //       },
        //       false
        //     ),
        //   ];
        // },
        // isoCube2(state): mxHandle[] {
        //   return [
        //     createHandle(
        //       state,
        //       ['isoAngle'],
        //       function (this, bounds) {
        //         const isoAngle =
        //           (Math.max(
        //             0.01,
        //             Math.min(
        //               94,
        //               parseFloat(mx.mxUtils.getValue(this.state.style, 'isoAngle', IsoCubeShape2.prototype.isoAngle))
        //             )
        //           ) *
        //             Math.PI) /
        //           200;
        //         const isoH = Math.min(bounds.width * Math.tan(isoAngle), bounds.height * 0.5);
        //
        //         return new mx.mxPoint(bounds.x, bounds.y + isoH);
        //       },
        //       function (this, bounds, pt) {
        //         this.state.style.isoAngle = Math.max(0, ((pt.y - bounds.y) * 50) / bounds.height);
        //       },
        //       true
        //     ),
        //   ];
        // },
        // curlyBracket: createDisplayHandleFunction(CurlyBracketShape.prototype.size, false),
      };

      // Exposes custom handles
      mx.mxGraph.prototype.createHandle = createHandle;
      mx.mxGraph.prototype.handleFactory = handleFactory;

      const vertexHandlerCreateCustomHandles = mx.mxVertexHandler.prototype.createCustomHandles;

      mx.mxVertexHandler.prototype.createCustomHandles = function (): mxHandle[] {
        let handles = vertexHandlerCreateCustomHandles.apply(this);

        if (this.graph.isCellRotatable(this.state.cell)) {
          // LATER: Make locked state independent of rotatable flag, fix toggle if default is false
          // if (this.graph.isCellResizable(this.state.cell) || this.graph.isCellMovable(this.state.cell))
          let name = this.state.style.shape;

          if (mx.mxCellRenderer.defaultShapes[name] === null && mx.mxStencilRegistry.getStencil(name) === null) {
            name = mx.mxConstants.SHAPE_RECTANGLE;
          } else if (this.state.view.graph.isSwimlane(this.state.cell)) {
            name = mx.mxConstants.SHAPE_SWIMLANE;
          }

          let fn = handleFactory[name];
          if (fn == null && this.state.shape != null && this.state.shape.isRoundable()) {
            fn = handleFactory[mx.mxConstants.SHAPE_RECTANGLE];
          }

          if (fn != null) {
            const temp = fn(this.state);

            if (temp !== null) {
              if (handles === null) {
                handles = temp;
              } else {
                handles = handles.concat(temp);
              }
            }
          }
        }

        return handles;
      };

      mx.mxEdgeHandler.prototype.createCustomHandles = function (): mxHandle[] {
        let name = this.state.style.shape;

        if (mx.mxCellRenderer.defaultShapes[name] === null && mx.mxStencilRegistry.getStencil(name) === null) {
          name = mx.mxConstants.SHAPE_CONNECTOR;
        }

        const fn = handleFactory[name];

        if (fn != null) {
          return fn(this.state);
        }

        return null;
      };
    } else {
      // Dummy entries to avoid NPE in embed mode
      mx.mxGraph.prototype.createHandle = function (): mxHandle {
        return null;
      };
      mx.mxGraph.prototype.handleFactory = {};
    }
    // endregion

    // region Constraints
    mx.mxRectangleShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), true),
    ];
    mx.mxEllipse.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
    ];
    // PartialRectangleShape.prototype.constraints = mxRectangleShape.prototype.constraints;
    mx.mxImageShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    mx.mxSwimlane.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    // PlusShape.prototype.constraints = mxRectangleShape.prototype.constraints;
    mx.mxLabel.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    NoteShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - s) * 0.5, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - s, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - s * 0.5, s * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, (h + s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));

      if (w >= s * 2) {
        constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      }

      return constr;
    };
    CardShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + s) * 0.5, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s * 0.5, s * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, (h + s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false));

      if (w >= s * 2) {
        constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      }

      return constr;
    };
    CubeShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const s = Math.max(0, Math.min(w, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size)))));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - s) * 0.5, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - s, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - s * 0.5, s * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, (h + s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + s) * 0.5, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s * 0.5, h - s * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, h - s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, (h - s) * 0.5));

      return constr;
    };
    CylinderShape3.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const s = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false, null, 0, s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false, null, 0, -s));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false, null, 0, -s));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, s + (h * 0.5 - s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false, null, 0, s + (h * 0.5 - s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false, null, 0, h - s - (h * 0.5 - s) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, h - s - (h * 0.5 - s) * 0.5));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.145, 0), false, null, 0, s * 0.29));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.855, 0), false, null, 0, s * 0.29));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.855, 1), false, null, 0, -s * 0.29));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.145, 1), false, null, 0, -s * 0.29));

      return constr;
    };
    // FolderShape.prototype.getConstraints = function(style, w, h) {
    //   const constr = [];
    //   const dx = Math.max(0, Math.min(w, parseFloat(mxUtils.getValue(this.style, "tabWidth", this.tabWidth))));
    //   const dy = Math.max(0, Math.min(h, parseFloat(mxUtils.getValue(this.style, "tabHeight", this.tabHeight))));
    //   const tp = mxUtils.getValue(this.style, "tabPosition", this.tabPosition);
    //
    //   if (tp == "left") {
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx * 0.5, 0));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx, 0));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx, dy));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + dx) * 0.5, dy));
    //   } else {
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - dx * 0.5, 0));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - dx, 0));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - dx, dy));
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - dx) * 0.5, dy));
    //   }
    //
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, (h - dy) * 0.25 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, (h - dy) * 0.5 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, (h - dy) * 0.75 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, h));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, (h - dy) * 0.25 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, (h - dy) * 0.5 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, (h - dy) * 0.75 + dy));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, h));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), false));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
    //   constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), false));
    //
    //   return (constr);
    // };
    InternalStorageShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    DataStorageShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    TapeDataShape.prototype.constraints = mx.mxEllipse.prototype.constraints;
    OrEllipseShape.prototype.constraints = mx.mxEllipse.prototype.constraints;
    SumEllipseShape.prototype.constraints = mx.mxEllipse.prototype.constraints;
    LineEllipseShape.prototype.constraints = mx.mxEllipse.prototype.constraints;
    ManualInputShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    DelayShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    DisplayShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const dx = Math.min(w, h / 2);
      const s = Math.min(w - dx, Math.max(0, parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))) * w);

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false, null));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (s + w - dx) * 0.5, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - dx, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false, null));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - dx, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (s + w - dx) * 0.5, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, s, h));

      return constr;
    };
    // ModuleShape.prototype.getConstraints = function(style, w, h) {
    //   const x0 = parseFloat(mxUtils.getValue(style, "jettyWidth", ModuleShape.prototype.jettyWidth)) / 2;
    //   const dy = parseFloat(mxUtils.getValue(style, "jettyHeight", ModuleShape.prototype.jettyHeight));
    //   const constr = [new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, x0),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false, null, x0),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), true),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, Math.min(h - 0.5 * dy, 1.5 * dy)),
    //     new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, Math.min(h - 0.5 * dy, 3.5 * dy))];
    //
    //   if (h > 5 * dy) {
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), false, null, x0));
    //   }
    //
    //   if (h > 8 * dy) {
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false, null, x0));
    //   }
    //
    //   if (h > 15 * dy) {
    //     constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), false, null, x0));
    //   }
    //
    //   return constr;
    // };
    LoopLimitShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    OffPageConnectorShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    mx.mxCylinder.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.15, 0.05), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.85, 0.05), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.3), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.7), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.3), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.7), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.15, 0.95), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.85, 0.95), false),
    ];
    UmlActorShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0.1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1 / 3), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1 / 3), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.5), false),
    ];
    // ComponentShape.prototype.constraints = [new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.3), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.7), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true)];
    mx.mxActor.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.2), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.1, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0.25), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.9, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true),
    ];
    SwitchShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.25), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.75), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false),
    ];
    CollateShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false),
    ];
    TapeShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.35), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.65), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.35), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.65), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), false),
    ];
    StepShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
    ];
    mx.mxLine.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
    ];
    // LollipopShape.prototype.constraints = [new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false)];
    mx.mxDoubleEllipse.prototype.constraints = mx.mxEllipse.prototype.constraints;
    mx.mxRhombus.prototype.constraints = mx.mxEllipse.prototype.constraints;
    mx.mxTriangle.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
    ];
    mx.mxHexagon.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.375, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.625, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.375, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.625, 1), true),
    ];
    mx.mxCloud.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.25), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.4, 0.1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.16, 0.55), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.07, 0.4), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.31, 0.8), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.13, 0.77), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.8, 0.8), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.55, 0.95), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.875, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.96, 0.7), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.625, 0.2), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.88, 0.25), false),
    ];
    ParallelogramShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    TrapezoidShape.prototype.constraints = mx.mxRectangleShape.prototype.constraints;
    DocumentShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.25), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), true),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.75), true),
    ];
    mx.mxArrow.prototype.constraints = null;
    TeeShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const dx = Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'dx', this.dx))));
      const dy = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'dy', this.dy))));
      const w2 = Math.abs(w - dx) / 2;

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, dy * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w * 0.75 + dx * 0.25, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + dx) * 0.5, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + dx) * 0.5, (h + dy) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + dx) * 0.5, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - dx) * 0.5, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - dx) * 0.5, (h + dy) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - dx) * 0.5, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w * 0.25 - dx * 0.25, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, dy * 0.5));

      return constr;
    };
    CornerShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const dx = Math.max(0, Math.min(w, parseFloat(mx.mxUtils.getValue(this.style, 'dx', this.dx))));
      const dy = Math.max(0, Math.min(h, parseFloat(mx.mxUtils.getValue(this.style, 'dy', this.dy))));

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, dy * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + dx) * 0.5, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx, dy));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx, (h + dy) * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, dx * 0.5, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false));

      return constr;
    };
    // CrossbarShape.prototype.constraints = [new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0, 1), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(0.75, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 1), false)];
    SingleArrowShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const aw =
        h * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowWidth', this.arrowWidth))));
      const as = w * Math.max(0, Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowSize', this.arrowSize))));
      const at = (h - aw) / 2;
      const ab = at + aw;

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, at));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - as) * 0.5, at));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - as, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - as, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w - as) * 0.5, h - at));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, h - at));

      return constr;
    };
    DoubleArrowShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const aw =
        h *
        Math.max(
          0,
          Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowWidth', SingleArrowShape.prototype.arrowWidth)))
        );
      const as =
        w *
        Math.max(
          0,
          Math.min(1, parseFloat(mx.mxUtils.getValue(this.style, 'arrowSize', SingleArrowShape.prototype.arrowSize)))
        );
      const at = (h - aw) / 2;
      const ab = at + aw;

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, as, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w * 0.5, at));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - as, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w - as, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w * 0.5, h - at));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, as, h));

      return constr;
    };
    CrossShape.prototype.getConstraints = function (style, w, h): mxConnectionConstraint[] {
      const constr = [];
      const m = Math.min(h, w);
      const size = Math.max(0, Math.min(m, m * parseFloat(mx.mxUtils.getValue(this.style, 'size', this.size))));
      const t = (h - size) / 2;
      const b = t + size;
      const l = (w - size) / 2;
      const r = l + size;

      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, t * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 0), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, 0));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, t * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, t));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, h - t * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0.5, 1), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, h));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, h - t * 0.5));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, r, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + r) * 0.5, t));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, t));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, w, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, (w + r) * 0.5, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l * 0.5, t));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, t));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, 0, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l * 0.5, b));
      constr.push(new mx.mxConnectionConstraint(new mx.mxPoint(0, 0), false, null, l, t));
      return constr;
    };
    // UmlLifeline.prototype.constraints = null;
    OrShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.25), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.75), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.7, 0.1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.7, 0.9), false),
    ];
    XorShape.prototype.constraints = [
      new mx.mxConnectionConstraint(new mx.mxPoint(0.175, 0.25), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.25, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.175, 0.75), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.7, 0.1), false),
      new mx.mxConnectionConstraint(new mx.mxPoint(0.7, 0.9), false),
    ];
    // RequiredInterfaceShape.prototype.constraints = [new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false)];
    // ProvidedRequiredInterfaceShape.prototype.constraints = [new mx.mxConnectionConstraint(new mx.mxPoint(0, 0.5), false),
    //   new mx.mxConnectionConstraint(new mx.mxPoint(1, 0.5), false)];
    // endregion
  }
}
