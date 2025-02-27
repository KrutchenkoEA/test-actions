/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { ITreeItem, ToolbarButtonType, TreeOptType } from '../../../../models';

@DecorateUntilDestroy()
@Injectable()
export class ViewerService {
  public currentVersion = '1.4.0';

  /** Если подключение по ws, то соккеты триггерят запрос ом атрибутов, если нет - кастомный интервал */
  public mnemoViewerType: 'ws' | 'rest' = 'rest';
  public mnemoUpdateType: 'ws' | 'rest' | 'custom' | null = null;

  public toolbarButtonEmit$: Subject<ToolbarButtonType> = new Subject<ToolbarButtonType>();
  public isFullScreen$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isLoadingViewer$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public hiddenChartOpt: boolean = true;
  public cleanDiagram$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public viewerTreeItemSelected$: Subject<ITreeItem | null> = new Subject<ITreeItem | null>();
  public viewerTabSelected$: Subject<number> = new Subject<number>();
  public selectedNodeType$: BehaviorSubject<TreeOptType> = new BehaviorSubject<TreeOptType>(null);
  public selectedNodeName$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  public isViewerInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isViewerInitActiveShapes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public viewerMnemoDestroy$: Subject<null> = new Subject<null>();
  public baseUrl: string;

  public disableEvents: boolean = true;
  public sizeEvents: number | null = null;

  public cleanData(): void {
    this.isViewerInit$.next(false);
    this.selectedNodeType$.next(null);
    this.selectedNodeName$.next(null);
    this.cleanDiagram$.next(true);
    this.viewerMnemoDestroy$.next(null);
  }

  public destroy(): void {
    this.viewerMnemoDestroy$.next(null);
    this.viewerMnemoDestroy$.complete();
  }

  public showVersion(): void {
    console.info('mnemo-viewer-ver: ', this.currentVersion);
  }
}
