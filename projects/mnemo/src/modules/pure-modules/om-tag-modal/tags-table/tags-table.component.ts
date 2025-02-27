/* eslint-disable import/no-extraneous-dependencies */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { EmitterNameType, ISourceModalResult, ITagsResponse } from '../../../../models';
import { RtdbTagApiService } from '../../../../services';

@DecorateUntilDestroy()
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'tags-table',
  templateUrl: './tags-table.component.html',
  styleUrls: ['./tags-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TagsTableComponent {
  private readonly rtdbTagApiService = inject(RtdbTagApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() public baseUrl: string = '';
  @Input() public multipleSelect: boolean = false;
  @Output() public selectedEmitter: EventEmitter<ISourceModalResult> = new EventEmitter<ISourceModalResult>();
  @ViewChild(CdkVirtualScrollViewport) public viewport: CdkVirtualScrollViewport;

  public isLoading: boolean = false;
  public isLoadingRow: boolean = false;
  public tags: ITagsResponse[] = [];
  public selectedTags: ITagsResponse[] | null = [];
  public searchStringTags: string = '';

  @Input()
  public set searchString(v: string | null) {
    this.searchStringTags = v;
    if (v === null) return;
    this.getTags(v);
  }

  @Input()
  public set clear(v: boolean | null) {
    if (v === null) return;

    this.selectedTags.forEach((t) => {
      t.isSelected = false;
    });
    this.selectedTags = [];
    this.emitAttributes();
    this.cdr.markForCheck();
  }

  @Input()
  public set newSelection(val: { source: { tagName: string }[]; key: EmitterNameType }) {
    if (!val) return;
    this.selectedTags = this.selectedTags?.filter((t) => {
      const res = val?.source?.find((tag) => t.name === tag.tagName);
      if (!res) {
        t.isSelected = false;
      }
      return !!res;
    });
  }

  public getTags(v: string, offset: number = 0, limit: number = 100, append: boolean = false): void {
    if (append) {
      this.isLoadingRow = true;
    } else {
      this.isLoading = true;
    }
    if (offset === 0) {
      this.tags = [];
    }
    this.rtdbTagApiService.getTags(v, offset, limit).subscribe({
      next: (tags) => {
        if (tags?.list) {
          if (append) {
            this.tags.push(...tags.list);
          } else {
            this.tags = tags.list;
          }
        }

        if (append) {
          this.isLoadingRow = false;
          this.viewport?.checkViewportSize();
        } else {
          this.isLoading = false;
        }
        this.cdr.markForCheck();
      },
      error: (e) => {
        console.error(e);
        if (append) {
          this.isLoadingRow = false;
        } else {
          this.isLoading = false;
        }
        this.cdr.markForCheck();
      },
    });
  }

  public selectTag(tag: ITagsResponse): void {
    if (this.multipleSelect) {
      this.multiSelect(tag);
    } else {
      this.singleSelect(tag);
    }
  }

  public scrollHandler(event): void {
    if (
      (window.devicePixelRatio === 1 &&
        event.target.scrollHeight - event.target.scrollTop - event.target.offsetHeight === 0) ||
      (window.devicePixelRatio !== 1 &&
        event.target.scrollHeight - event.target.scrollTop - event.target.offsetHeight < 1)
    ) {
      if (this.isLoadingRow || this.tags?.length < 100) return;
      this.getTags(this.searchStringTags, this.tags?.length ?? 0, 100, true);
    }
  }

  private singleSelect(tag: ITagsResponse): void {
    if (tag.guid === this.selectedTags[0]?.guid) {
      tag.isSelected = false;
      this.selectedTags = [];
    } else {
      if (this.selectedTags[0]) {
        this.selectedTags[0].isSelected = false;
      }
      tag.isSelected = true;
      this.selectedTags = [tag];
    }
    this.emitAttributes();
    this.cdr.markForCheck();
  }

  private multiSelect(tag: ITagsResponse): void {
    const index = this.selectedTags.findIndex((t) => t.guid === tag.guid);
    if (index === -1) {
      tag.isSelected = true;
      this.selectedTags.push(tag);
    } else {
      tag.isSelected = false;
      this.selectedTags.splice(index, 1);
    }
    this.emitAttributes();
    this.cdr.markForCheck();
  }

  private emitAttributes(): void {
    this.selectedEmitter.emit({
      multiple: this.multipleSelect,
      tags: this.selectedTags?.map((t) => {
        return {
          tagName: t.name,
          tagId: t.guid,
        };
      }),
    });
  }
}
