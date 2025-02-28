/* eslint-disable import/no-extraneous-dependencies */
import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import {
  takeUntilDestroyed,
  UNIQUE_ID,
  uuidGenerate,
  VirtualChannel,
  WIDGET_ID,
  WidgetPlatform,
  WidgetService,
} from '@tl-platform/core';
import { combineLatest, debounceTime, skip, Subscription } from 'rxjs';
import { IMnemoLite, ITagsWS } from '../../../../models';
import { MnemoLoggerService } from '../../../../services';
import { ViewerRefreshService, ViewerService, ViewerTagService } from '../services';
import { ViewerCheckerService } from '../services/viewer-checker.service';

@Directive({
  selector: '[viewerCoreWsDirective]',
  standalone: true,
})
export class ViewerCoreWsDirective extends WidgetPlatform<unknown> implements OnInit, OnDestroy {
  public id: string;
  public uniqId: string;

  public viewerService = inject(ViewerService);
  public viewerTagService = inject(ViewerTagService);
  public viewerRefreshService = inject(ViewerRefreshService);
  public viewerCheckerService = inject(ViewerCheckerService);
  public mnemoLoggerService = inject(MnemoLoggerService);

  private virtualChannels: { channel: VirtualChannel<unknown>; sub: Subscription }[] | null = [];
  private readonly vcActiveMap: Map<string, boolean> = new Map<string, boolean>();

  constructor() {
    const widgetService = inject(WidgetService);
    const id = inject(WIDGET_ID);
    const uniqId = inject(UNIQUE_ID);

    super(widgetService, id, uniqId);
    this.widgetService = widgetService;
    this.id = id;
    this.uniqId = uniqId;
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit(): void {
    super.widgetInit();

    this.viewerCheckerService.init();

    combineLatest([
      this.viewerRefreshService.isUpdateData$,
      this.viewerTagService.tagsNames$,
      this.viewerTagService.tagsNamesActiveShapes$,
    ])
      .pipe(skip(1), debounceTime(300), takeUntilDestroyed(this))
      .subscribe(([v, tags, tagsActiveShapes]) => {
        if (v) {
          const mappedTags =
            tags?.map((tag) => {
              return { name: tag.name, withFormat: tag.roundValue ?? false };
            }) ?? [];

          const mappedTagsActiveShapes =
            tagsActiveShapes?.map((tag) => {
              return { name: tag.name, withFormat: false };
            }) ?? [];

          this.appendOptions({
            tagnames: [...mappedTags, ...mappedTagsActiveShapes],
          });
        } else {
          this.appendOptions({ tagnames: [] });
        }
      });
  }

  public override ngOnDestroy(): void {
    this.viewerService.cleanData();
    super.ngOnDestroy();
  }

  public appendOptions(opt: { tagnames: { name: string; withFormat: boolean }[] } | null): void {
    if (this.viewerTagService.tagsNamesOnly$.value?.length < 60) {
      super.setWsOptions(opt);
      return;
    }

    if (opt?.tagnames?.length) {
      const step = 20;
      for (let i = 0; i < opt.tagnames?.length; i += step) {
        const id = uuidGenerate();
        this.createVirtualChannel(id, opt.tagnames.slice(i, i + step));
        this.vcActiveMap.set(id, false);
      }
    } else {
      this.disposeVirtualChannels();
    }
  }

  public createVirtualChannel(subchannelId: string, tagNames: { name: string; withFormat: boolean }[]): void {
    const virtualChannel: VirtualChannel<unknown> = new VirtualChannel(this.widgetService, {
      channelId: this.id,
      subchannelId,
    });
    setTimeout(() => virtualChannel.setOptions({ tagnames: tagNames }), 1000);
    this.virtualChannels.push({
      channel: virtualChannel,
      sub: virtualChannel.data$.pipe(takeUntilDestroyed(this)).subscribe((d: ITagsWS) => {
        this.viewerTagService.updateTagData$.next(d.tagValues);
        if (!this.viewerTagService.isTagsStart$.value) {
          this.vcActiveMap.set(subchannelId, true);

          const active: boolean[] = [];
          // eslint-disable-next-line no-restricted-syntax
          for (const val of this.vcActiveMap.values()) {
            if (val === true) {
              active.push(true);
            }
          }

          if (active.length === this.vcActiveMap.size) {
            this.viewerTagService.isTagsStart$.next(true);

            switch (this.viewerService.selectedNodeType$.value) {
              case 'mnemoscheme':
                this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.mnemoschemeReady');
                break;
              case 'table':
                this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.tableReady');
                break;
              case 'dashboard':
                this.mnemoLoggerService.catchMessage('ok', 'mnemo.AppComponent.dashboardReady');
                break;
              default:
                break;
            }
          }
        }
      }),
    });
  }

  public disposeVirtualChannels(): void {
    if (this.viewerTagService.tagsNamesOnly$.value?.length < 80) {
      super.setWsOptions({ tagnames: [] });
    } else {
      this.virtualChannels.forEach((item) => {
        item.channel.dispose();
        item.sub.unsubscribe();
      });
    }
    this.virtualChannels = [];
    this.vcActiveMap.clear();
  }

  protected override dataConnect(): void {
    super.dataConnect();
  }

  protected dataHandler(ref: IMnemoLite): void {
    if (ref?.tagValues) {
      if (!this.viewerTagService.isTagsStart$.value) {
        this.viewerTagService.isTagsStart$.next(true);
        this.viewerCheckerService.checkReady();
      }
    }

    this.viewerTagService.updateTagData$.next(ref.tagValues);
  }
}
