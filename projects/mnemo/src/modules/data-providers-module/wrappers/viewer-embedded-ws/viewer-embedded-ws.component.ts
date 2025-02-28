/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed, WidgetService } from '@tl-platform/core';
import { TluiButtonModule, TluiLottieAnimationModule } from '@tl-platform/ui';
import { AngularSvgIconModule } from 'angular-svg-icon';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BehaviorSubject, filter } from 'rxjs';
import { ITreeItem, IXmlDiagram } from '../../../../models';
import { MnemoLoggerService, MnemoschemeTreeApiService, ViewerDecodeService } from '../../../../services';
import { ViewerDashboardComponent, ViewerMnemoModule, ViewerTableModule } from '../../../data-providers-module';
import { AbstractAppService, ViewerCoreModule, ViewerCoreVcDirective, ViewerService } from '../../../pure-modules';
import { MnemoChartModule, ViewerToolbarComponent } from '../../../additional-modules';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-viewer-embedded-ws',
  templateUrl: './viewer-embedded-ws.component.html',
  styleUrl: './viewer-embedded-ws.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AngularSvgIconModule,
    ViewerCoreModule,
    MnemoChartModule,
    ViewerTableModule,
    TluiButtonModule,
    TluiLottieAnimationModule,
    TranslocoPipe,
    NgxSkeletonLoaderModule,
    NgTemplateOutlet,
    NgIf,
    AsyncPipe,
    ViewerToolbarComponent,
    ViewerMnemoModule,
    ViewerDashboardComponent,
  ],
})
export class ViewerEmbeddedWsComponent extends ViewerCoreVcDirective implements OnInit, AfterViewInit, OnDestroy {
  protected readonly widgetService: WidgetService = inject(WidgetService);

  @ViewChild('chartSelectorRef', { read: ElementRef }) public chartSelector: ElementRef;

  public diagram: IXmlDiagram = { xml: null, json: null, table: null, dashboard: null, table2: null };
  public mnemoGuid: string = null;

  public reSizeWorkArea$: BehaviorSubject<[number, number]> = new BehaviorSubject([0, 0]);

  public viewerService = inject(ViewerService);
  public mnemoschemeTreeApiService = inject(MnemoschemeTreeApiService);
  public viewerDecodeService = inject(ViewerDecodeService);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  public mnemoLoggerService = inject(MnemoLoggerService);

  constructor(public appService: AbstractAppService) {
    super();
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();

    this.router.navigate([], {
      queryParams: { mnemoGuid: null },
      queryParamsHandling: 'merge',
    });
  }

  public ngOnInit(): void {
    super.ngOnInit();
    this.viewerService.baseUrl = this.appService.getBaseUrl();

    this.viewerService.viewerTreeItemSelected$.pipe(takeUntilDestroyed(this)).subscribe((node) => this.applyData(node));
  }

  @HostListener('document:resize')
  public onResize(): void {
    this.reSizeWorkArea$.next([1, 1]);
  }

  public ngAfterViewInit(): void {
    this.mnemoGuid = this.route.snapshot.queryParamMap.get('mnemoGuid') ?? null;
    if (this.mnemoGuid) {
      this.loadByMnemoGuid(true);
    }
  }

  public loadByMnemoGuid(setUrl: boolean = false): void {
    try {
      if (this.mnemoGuid) {
        this.mnemoschemeTreeApiService
          .getItemById(this.mnemoGuid)
          .pipe(takeUntilDestroyed(this))
          .subscribe({
            next: (node) => this.applyData(node),
            error: () => this.getXmlData(this.mnemoGuid),
          });
      } else {
        this.mnemoLoggerService.catchMessage('error', 'mnemo.AppComponent.pathError');
      }
      this.router.navigate([], {
        queryParams: {
          mnemoGuid: setUrl ? (this.mnemoGuid ?? null) : null,
        },
        queryParamsHandling: 'merge',
      });
    } catch (e) {
      // ignore
    }
  }

  public applyData(node: ITreeItem): void {
    if (node && node.id) {
      if (node.type === 'mnemoscheme') {
        this.viewerService.selectedNodeType$.next('mnemoscheme');
        this.getXmlData(node.fileId);
      }
      if (node.type === 'table') {
        this.viewerService.selectedNodeType$.next('table');
        this.getJsonData(node.fileId);
      }
      if (node.type === 'dashboard') {
        this.viewerService.selectedNodeType$.next('dashboard');
        this.getJsonData(node.fileId);
      }
      this.viewerService.selectedNodeName$.next(node.name);
    } else {
      this.viewerService.selectedNodeName$.next('');
    }
  }

  public getXmlData(id: string): void {
    this.viewerService.isLoadingViewer$.next(true);
    this.mnemoschemeTreeApiService
      .getXmlFromFileStorage(id)
      .pipe(
        filter((data) => !!data),
        takeUntilDestroyed(this),
      )
      .subscribe((diagram) => this.setXmlData(diagram.xml));
  }

  public getJsonData(id: string): void {
    this.viewerService.isLoadingViewer$.next(true);
    this.mnemoschemeTreeApiService
      .getJsonFromFileStorage(id)
      .pipe(
        filter((data) => !!data),
        takeUntilDestroyed(this),
      )
      .subscribe((json) => this.setJsonData(json));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async setXmlData(xml: any): Promise<void> {
    this.viewerService.isLoadingViewer$.next(true);
    const xmlData = await this.viewerDecodeService.decode(xml);
    this.diagram = { xml: xmlData, json: null, table: null, dashboard: null, table2: null };
    this.viewerService.isLoadingViewer$.next(false);
    this.viewerService.selectedNodeType$.next('mnemoscheme');
    this.mnemoLoggerService.catchMessage('info', 'mnemo.AppComponent.mnemoschemeStart');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setJsonData(json: any): void {
    let parsedData = JSON.parse(json);
    let type: 'table' | 'dashboard' = 'table';
    if (typeof parsedData === 'string') {
      parsedData = JSON.parse(parsedData);
    }
    if (Array.isArray(parsedData)) {
      type = 'dashboard';
    }
    if (type === 'dashboard') {
      this.viewerService.selectedNodeType$.next('dashboard');
      this.mnemoLoggerService.catchMessage('info', 'mnemo.AppComponent.dashboardStart');
    } else {
      this.viewerService.selectedNodeType$.next(parsedData?.appVersion ? 'table2' : 'table');
      this.mnemoLoggerService.catchMessage('info', 'mnemo.AppComponent.tableStart');
    }

    this.diagram = {
      xml: null,
      json: null,
      // eslint-disable-next-line no-nested-ternary
      table: type === 'dashboard' ? null : parsedData?.appVersion ? null : parsedData,
      dashboard: type === 'dashboard' ? parsedData : null,
      table2: parsedData?.appVersion ? parsedData : null,
    };
  }
}
