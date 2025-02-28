/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable func-names */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApplicationRef, ComponentRef, createComponent, inject, Injectable, Injector } from '@angular/core';
import { mxCell, mxGraph } from 'mxgraph';
import { mx } from '../../../../../config/mxObject';
import { DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES, DEFAULT_STYLES } from '../../../../../consts';
import { DataItemTypeEnum, MnemoGraphAbstract, ShapeTypeEnum } from '../../../../../models';
import { ActiveShapesMnemoWrapperComponent, ActiveShapesWrapperAbstract } from '../../../active-shapes';

@Injectable()
export class MnemoGraphService implements MnemoGraphAbstract {
  private readonly injector = inject(Injector);

  public graph: mxGraph;
  private appRef: ApplicationRef;

  public customShapesComponentRefs: Map<string, ComponentRef<ActiveShapesWrapperAbstract>> = new Map<
    string,
    ComponentRef<ActiveShapesWrapperAbstract>
  >();

  public init(graph: mxGraph, appRef: ApplicationRef): void {
    this.graph = graph;
    this.appRef = appRef;

    this.updatePrototype();
    this.setOptions();
    this.setStyle();
  }

  public destroy(): void {
    // eslint-disable-next-line no-restricted-syntax
    for (const item of this.customShapesComponentRefs.values()) {
      item?.destroy();
    }

    this.customShapesComponentRefs.clear();
  }

  private updatePrototype(): void {
    mx.mxGraph.prototype.convertValueToString = (cell): HTMLElement | string => {
      if (cell.style.indexOf('shape=customShape') !== -1) {
        const cellState = this.graph.view.getState(cell);

        const instance = this.customShapesComponentRefs.get(cell.getId())?.instance;
        if (
          instance ||
          (Math.abs((instance?.size.width || 0) - cellState.width / this.graph.view.scale) < Number.EPSILON &&
            Math.abs((instance?.size.height || 0) - cellState.height / this.graph.view.scale) < Number.EPSILON)
        ) {
          if (instance && cell?.activeShape && !instance?.item) {
            instance.item = cell.activeShape;
          }

          return this.customShapesComponentRefs.get(cell.id).location.nativeElement as HTMLElement;
        }

        const element = document.createElement('ng-container');
        const componentRef = createComponent<ActiveShapesWrapperAbstract>(ActiveShapesMnemoWrapperComponent, {
          environmentInjector: this.appRef.injector,
          hostElement: element,
          elementInjector: this.injector,
        });

        componentRef.setInput('item', cell.activeShape);
        componentRef.setInput('viewType', cell.viewElementType);
        componentRef.setInput('dataType', cell.dataItemType ?? DataItemTypeEnum.Line);
        componentRef.setInput('exampleView', false);

        componentRef.setInput('size', {
          width: (cellState.width ?? DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES.width) / this.graph.view.scale,
          height: (cellState.height ?? DEFAULT_ACTIVE_ELEMENTS_SHAPE_PROPERTIES.height) / this.graph.view.scale,
        });

        componentRef.changeDetectorRef.detectChanges();
        this.appRef.attachView(componentRef.hostView);
        this.customShapesComponentRefs.set(cell.getId(), componentRef);
        return element;
      }

      const value = this.graph?.getModel()?.getValue(cell);

      if (value != null) {
        if (mx.mxUtils.isNode(value, null)) {
          return value.nodeName;
        }
        if (typeof value.toString === 'function') {
          let resValue = value.toString();
          if (cell?.showUnits) {
            resValue += cell?.unitName ? ` ${cell?.unitName}` : '';
          }
          return resValue;
        }
      }

      return cell.value?.toString() ?? '';
    };

    mx.mxCodec.prototype.decode = function(node: Element, into: Element): Element {
      if (node !== null && node.nodeType === mx.mxConstants.NODETYPE_ELEMENT) {
        const ctor = mx[node.nodeName as keyof typeof mx] || window[node.nodeName];
        if (!ctor) {
          throw new Error(`Missing constructor for ${node.nodeName}`);
        }
        const dec = mx.mxCodecRegistry.getCodec(ctor);
        if (dec !== null) {
          return dec.decode(this, node, into);
        }
        const obj = node.cloneNode(true) as Element;
        obj.removeAttribute('as');
        return obj;
      }
      return null;
    };

    mx.mxGraph.prototype.getLabel = function(cell: mxCell): string | Node {
      if (this.labelsVisible && cell != null) {
        const value = this.model.getValue(cell);
        const style = this.getCurrentCellStyle(cell);

        if (mx.mxUtils.isNode(value, null) && cell.value.nodeName.toLowerCase() === 'object') {
          return cell.getAttribute('tagValue', null);
        }

        if (!mx.mxUtils.getValue(style, mx.mxConstants.STYLE_NOLABEL, false)) {
          return this.convertValueToString(cell);
        }
      }
      return '';
    };

    // mx.mxPopupMenuHandler.apply(this, arguments);

    mx.mxPopupMenu.prototype.createSubmenu = function(parent: any): void {
      parent.table = document.createElement('table');
      parent.table.className = 'mxPopupMenu';

      parent.tbody = document.createElement('tbody');
      parent.table.appendChild(parent.tbody);

      parent.div = document.createElement('div');
      parent.div.className = 'mxPopupMenu';

      parent.div.style.position = 'absolute';
      parent.div.style.display = 'inline';
      parent.div.style.zIndex = this.zIndex;

      parent.div.appendChild(parent.table);
    };

    const graphDblClick = mx.mxGraph.prototype.dblClick;
    mx.mxGraph.prototype.dblClick = function(event, cell): void {
      if (cell.cellType === ShapeTypeEnum.ActiveElement) {
        return null;
      }
      return graphDblClick.apply(this, [event, cell]);
    };

    const graphMouseMove = mx.mxPanningHandler.prototype.mouseMove;

    mx.mxPanningHandler.prototype.mouseMove = function(sender, me): void {
      const cell = me.getCell();
      if (cell?.cellType === ShapeTypeEnum.ActiveElement) {
        return null;
      }

      return graphMouseMove.apply(this, [sender, me]);
    };
  }

  private setOptions(): void {
    this.graph.setPanning(true);
    this.graph.panningHandler.ignoreCell = true;
    this.graph.centerZoom = true;
    this.graph.setHtmlLabels(true);
    this.graph.setTooltips(true);
  }

  private setStyle(): void {
    mx.mxGraphHandler.prototype.previewColor = DEFAULT_STYLES.previewColor;

    mx.mxConstants.VERTEX_SELECTION_COLOR = DEFAULT_STYLES.selectionColor;
    mx.mxConstants.EDGE_SELECTION_COLOR = DEFAULT_STYLES.selectionColor;
    mx.mxConstants.GUIDE_COLOR = DEFAULT_STYLES.previewColor;

    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mx.mxConstants.STYLE_CURVED] = false;
    style[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.ElbowConnector;

    const vertexStyle = this.graph.getStylesheet().getDefaultVertexStyle();
    vertexStyle.fillColor = DEFAULT_STYLES.fillColor;
    vertexStyle.strokeColor = DEFAULT_STYLES.strokeColor;
    vertexStyle.fontColor = DEFAULT_STYLES.fontColor;
    vertexStyle.fontSize = DEFAULT_STYLES.fontSize;

    const edgeStyle = this.graph.getStylesheet().getDefaultEdgeStyle();
    edgeStyle[mx.mxConstants.STYLE_EDGE] = mx.mxEdgeStyle.OrthConnector;
  }
}
