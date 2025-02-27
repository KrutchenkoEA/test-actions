/* eslint-disable import/no-extraneous-dependencies */
import { Directive, inject, OnDestroy, OnInit } from '@angular/core';
import { takeUntilDestroyed, uuidGenerate, VirtualChannel, WIDGET_ID, WidgetService } from '@tl-platform/core';
import { combineLatest, skip, Subscription } from 'rxjs';
import { ITagsWS } from '../../../../models';
import { ViewerRefreshService, ViewerService, ViewerTagService } from '../services';
import { ViewerCheckerService } from '../services/viewer-checker.service';

// подменный айди виджета, где работают мнемосхемы
export const MNEMO_WIDGET_ID = '5e75956f-4a7a-4944-b45c-b0ab258c10a2';

@Directive({
  selector: '[viewerCoreVsDirective]',
  standalone: true,
})
export class ViewerCoreVcDirective implements OnInit, OnDestroy {
  protected readonly widgetService = inject(WidgetService);
  public id = inject(WIDGET_ID);

  // public id = WIDGET_ID;
  public viewerService = inject(ViewerService);
  public viewerTagService = inject(ViewerTagService);
  public viewerRefreshService = inject(ViewerRefreshService);
  public viewerCheckerService = inject(ViewerCheckerService);

  private virtualChannels: { channel: VirtualChannel<unknown>; sub: Subscription }[] | null = [];
  private readonly vcActiveMap: Map<string, boolean> = new Map<string, boolean>();

  constructor() {
    const id = this.id;

    if (!id) {
      this.id = MNEMO_WIDGET_ID;
    }
  }

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnInit(): void {
    this.viewerCheckerService.init();

    combineLatest([
      this.viewerRefreshService.isUpdateData$,
      this.viewerTagService.tagsNames$,
      this.viewerTagService.tagsNamesActiveShapes$,
    ])
      .pipe(skip(1), takeUntilDestroyed(this))
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

  // eslint-disable-next-line @angular-eslint/contextual-lifecycle
  public ngOnDestroy(): void {
    this.viewerService.cleanData();
    this.disposeVirtualChannels();
  }

  public appendOptions(opt: { tagnames: { name: string; withFormat: boolean }[] } | null): void {
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
            this.viewerCheckerService.checkReady();
          }
        }
      }),
    });
  }

  public disposeVirtualChannels(): void {
    this.virtualChannels.forEach((item) => {
      item.channel.dispose();
      item.sub.unsubscribe();
    });
    this.virtualChannels = [];
    this.vcActiveMap.clear();
  }
}
