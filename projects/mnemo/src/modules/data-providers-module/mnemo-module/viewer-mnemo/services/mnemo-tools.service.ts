/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { ThemeConfiguratorService } from '@tl-platform/core';
import { saveAs } from 'file-saver';
import { mxGraph, mxRectangle } from 'mxgraph';
import { Subscription, take } from 'rxjs';
import { mx } from '../../../../../config/mxObject';
import { DARK_THEME, LIGHT_THEME } from '../../../../../consts';
import { ViewerService } from '../../../../pure-modules';
import { MnemoGraphAbstract, IMnemoUnsubscribed } from '../../../../../models';

@Injectable()
export class MnemoToolsService implements MnemoGraphAbstract, IMnemoUnsubscribed {
  public viewerService = inject(ViewerService);
  public themeService = inject(ThemeConfiguratorService);

  public subscriptions: Subscription[] = [];
  public graph: mxGraph;
  private backgroundColorStyle: string = 'transparent';

  public get backgroundColor(): string {
    return this.backgroundColorStyle;
  }

  public set backgroundColor(v: string) {
    if (!v) {
      this.backgroundColorStyle = 'transparent';
    }
    this.backgroundColorStyle = v;
  }

  public init(graph: mxGraph): void {
    this.graph = graph;

    this.initSubs();
  }

  public destroy(): void {
    this.destroySubs();
  }

  public initSubs(): void {
    const buttonSub$ = this.viewerService.toolbarButtonEmit$.subscribe((type) => {
      switch (type) {
        case 'zoomIn':
          this.onClickZoomIn();
          break;
        case 'zoomOut':
          this.onClickZoomOut();
          break;
        case 'zoomDefault':
          this.onClickZoomDefault();
          break;
        case 'save':
          this.onClickSaveXml();
          break;
        case 'print':
          this.onClickPrintXml();
          break;
        default:
          break;
      }
    });

    const tabSub$ = this.viewerService.viewerTabSelected$.subscribe(() => setTimeout(() => this.onClickZoomDefault()));

    this.subscriptions.push(buttonSub$);
    this.subscriptions.push(tabSub$);
  }

  public destroySubs(): void {
    this.subscriptions?.forEach((sub) => sub.unsubscribe());
    this.subscriptions = [];
  }

  public onClickZoomIn(): void {
    this.graph?.zoomIn();
  }

  public onClickZoomOut(): void {
    this.graph?.zoomOut();
  }

  public onClickZoomDefault(): void {
    this.graph?.zoomActual();
    this.graph?.fit(0);
  }

  public onClickSaveXml(): void {
    // eslint-disable-next-line new-cap
    const encoder = new mx.mxCodec();
    const node = encoder.encode(this.graph.getModel());
    const xml = mx.mxUtils.getPrettyXml(node);
    const filename = `${
      this.viewerService.selectedNodeName$.value
        ? this.viewerService.selectedNodeName$.value
        : `mnemo${new Date().toLocaleString()}`
    }.xml`;
    const file: File = new File([xml], filename, { type: 'text/xml;charset=utf-8' });
    saveAs(file, filename);
  }

  public onClickPrintXml(): void {
    let isDarkTheme: boolean = false;
    this.themeService.isDarkTheme.pipe(take(1)).subscribe((value) => {
      isDarkTheme = value;
    });

    let orientation: 'portrait' | 'landscape' = 'portrait';
    let xCenter: number | null = null;
    let yCenter: number | null = null;
    // eslint-disable-next-line new-cap
    const pageFormat: mxRectangle = new mx.mxRectangle(0, 0, 0, 0);
    const graphSize: mxRectangle = this.graph.getGraphBounds();
    if (graphSize.width > graphSize.height) {
      orientation = 'landscape';
    }
    let listSize: mxRectangle = mx.mxConstants.PAGE_FORMAT_A4_PORTRAIT;
    if (orientation === 'portrait') {
      pageFormat.width = listSize.width - 120;
      pageFormat.height = listSize.height - 150;
    } else {
      listSize = mx.mxConstants.PAGE_FORMAT_A4_LANDSCAPE;
      pageFormat.width = listSize.width - 100;
      pageFormat.height = listSize.height - 100;
    }
    if (listSize.width / 2 > graphSize.width) {
      xCenter = pageFormat.width / 2 - graphSize.getCenterX();
    }
    if (listSize.height / 2 > graphSize.height) {
      yCenter = pageFormat.height / 2 - graphSize.getCenterY();
    }
    const scale: number = mx.mxUtils.getScaleForPageCount(1, this.graph, pageFormat, 0);
    // eslint-disable-next-line new-cap
    const preview = new mx.mxPrintPreview(
      this.graph,
      scale,
      // @ts-ignore: Unreachable code error
      pageFormat,
      null,
      xCenter,
      yCenter,
      null,
      `${this.viewerService.selectedNodeName$?.value} ${new Date().toLocaleString()}`,
      true,
    );

    const style: string =
      `body {${isDarkTheme ? DARK_THEME : LIGHT_THEME}}` +
      `div#mxPage-1 {background-color: ${this.backgroundColor} !important}}`;
    preview.open(style);
  }
}
