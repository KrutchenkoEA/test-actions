/* eslint-disable import/no-extraneous-dependencies */
import {
  AfterViewInit,
  ApplicationRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { mxCell, mxGraph } from 'mxgraph';
import { Observable } from 'rxjs';
import { mx } from '../../../../config/mxObject';
import { MnemoLoggerService } from '../../../../services';
import { ViewerService } from '../../../pure-modules';
import { ExtendedShapesService, PureCustomShapeService } from '../mx-graph-services';
import { MnemoGraphService, MnemoToolsService, MnemoTooltipService, MnemoValueService } from './services';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-viewer-mnemo',
  templateUrl: './viewer-mnemo.component.html',
  styleUrls: ['./viewer-mnemo.component.scss'],
})
export class ViewerMnemoComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  public viewerService = inject(ViewerService);
  private readonly appRef = inject(ApplicationRef);
  private readonly mnemoGraphService = inject(MnemoGraphService);
  private readonly pureCustomShapeService = inject(PureCustomShapeService);
  private readonly extendedShapesService = inject(ExtendedShapesService);
  private readonly mnemoTooltipService = inject(MnemoTooltipService);
  private readonly mnemoValueService = inject(MnemoValueService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public mnemoToolsService = inject(MnemoToolsService);

  @Input() public xmlData: string;
  @ViewChild('graphContainer') public graphContainer: ElementRef<HTMLElement>;
  public isLoading$: Observable<boolean>;
  private container: HTMLElement;
  private graph: mxGraph;
  private metaInfoCell: mxCell | null = null;

  @Input()
  public set reSizeWorkArea(v: [number, number]) {
    this.mnemoToolsService.onClickZoomDefault();
  }

  public ngOnChanges(): void {
    this.graph?.refresh(null);
    if (!this.xmlData) {
      this.graph?.destroy();
    }
  }

  public ngOnInit(): void {
    this.isLoading$ = this.viewerService.isLoadingViewer$.asObservable();
    this.viewerService.sizeEvents = 0;
  }

  public ngAfterViewInit(): void {
    if (!mx.mxClient.isBrowserSupported()) {
      this.mnemoLoggerService.catchErrorMessage('error', 'Browser is not supported', null, false);
    }

    if (!this.xmlData) {
      return;
    }

    this.container = <HTMLElement> document.getElementById('mx-graph-container');
    // eslint-disable-next-line new-cap
    this.graph = new mx.mxGraph(this.container);

    this.mnemoGraphService.init(this.graph, this.appRef);
    this.mnemoValueService.init(this.graph, this.graphContainer);
    this.mnemoTooltipService.init(this.graph);
    this.mnemoToolsService.init(this.graph);
    this.pureCustomShapeService.registerShapes(mx);
    this.extendedShapesService.registerShapes(mx);

    this.draw();
    this.setEventsListeners();
  }

  public ngOnDestroy(): void {
    this.mnemoGraphService.destroy();
    this.mnemoValueService.destroy();
    this.mnemoToolsService.destroy();

    if (this.xmlData) {
      // Нужно передавать функцию третьим аргументом
      mx.mxEvent.removeListener(this.container, 'wheel', null);
      this.graph.destroy();
    }

    this.viewerService.destroy();
  }

  private draw(): void {
    this.metaInfoCell = this.graph?.getModel().getCell('metaInfo');
    this.mnemoToolsService.backgroundColor =
      this.metaInfoCell?.getAttribute('backgroundColor', 'transparent') ?? 'transparent';

    const xmlDocument = mx.mxUtils.parseXml(this.xmlData);
    // eslint-disable-next-line new-cap
    const codec = new mx.mxCodec(xmlDocument);
    codec.decode(xmlDocument.documentElement, this.graph.getModel());

    this.mnemoValueService.getCellSourceItems();
    this.graph?.view.setScale(1);
    this.mnemoToolsService.onClickZoomDefault();
  }

  private setEventsListeners(): void {
    mx.mxEvent.disableContextMenu(this.container);

    mx.mxEvent.addListener(this.container, 'wheel', (evt) => {
      evt.stopPropagation();
      evt.preventDefault();
      if (evt.deltaY < 0) {
        this.mnemoToolsService.onClickZoomIn();
      } else {
        this.mnemoToolsService.onClickZoomOut();
      }
    });
  }
}
