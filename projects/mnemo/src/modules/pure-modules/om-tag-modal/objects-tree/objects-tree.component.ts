/* eslint-disable import/no-extraneous-dependencies */
import { Direction } from '@angular/cdk/bidi';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { DecorateUntilDestroy, LANGS_ENUM, LANGS_LABELS } from '@tl-platform/core';
import { BehaviorSubject } from 'rxjs';
import { slideInOutTop } from '../../../../consts';
import { IListTreeItem, IResponseTreeItem, ObjectEntityTypeEnum } from '../../../../models';
import { OmTreeService } from '../om-tree.service';

@DecorateUntilDestroy()
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'om-tag-object-tree',
  templateUrl: './objects-tree.component.html',
  styleUrls: ['./objects-tree.component.scss'],
  animations: [slideInOutTop],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectsTreeComponent implements OnInit {
  private readonly omTreeService = inject(OmTreeService);
  private readonly translocoService = inject(TranslocoService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() public baseUrl: string = '';
  @Input() public multipleSelect: boolean = false;
  @Input() public multipleSelectObject: boolean = false;
  @Input() public selectedPathArray: string[] = [];
  @Input() public dragAvailable: boolean = false;
  @Input() public dragShapesUrl: string = '';
  @Input() public cacheTree: boolean = true;

  @Output() public itemSelectedEmitter: EventEmitter<IListTreeItem | null> = new EventEmitter<IListTreeItem | null>();
  @Output() public checkboxSelectedEmitter: EventEmitter<IListTreeItem[] | null> = new EventEmitter<
    IListTreeItem[] | null
  >();

  @Output() public dragTreeElement: EventEmitter<IListTreeItem> = new EventEmitter<IListTreeItem>();

  @ViewChild('dragImage', { read: ElementRef }) public dragImage: ElementRef;

  public isLoading: boolean = false;
  public isShadowLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public currentDirection: Direction = 'ltr';

  public tree: IListTreeItem[] = [];
  private selectedCheckbox: IListTreeItem[] = [];
  private selectedItem: IListTreeItem | null = null;

  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('loading')
  public set load(l: boolean) {
    this.isShadowLoading$.next(l);
  }

  @Input()
  public set newSelectedPathArray(path: string[]) {
    this.unExpandAndUnSelect();
    this.selectedPathArray = path;
    this.expandAndSelect();
  }

  @Input()
  public set clear(v: boolean | null) {
    if (v === null) return;
    this.selectedCheckbox.forEach((item) => {
      if (item?.isCheckboxSelected) {
        item.isCheckboxSelected = false;
      }
      if (item?.isSelected) {
        item.isSelected = false;
      }
    });
    if (this.selectedItem?.isSelected) {
      this.selectedItem.isSelected = false;
    }
    if (this.selectedItem?.isCheckboxSelected) {
      this.selectedItem.isCheckboxSelected = false;
    }

    this.selectedCheckbox = [];
    this.selectedItem = null;

    this.checkboxSelectedEmitter.emit(this.selectedCheckbox);
    this.itemSelectedEmitter.emit(this.selectedItem);
    this.cdr.markForCheck();
  }

  public ngOnInit(): void {
    this.currentDirection = LANGS_LABELS.get(<LANGS_ENUM> this.translocoService.getActiveLang()).dir;
    this.loadTrees();
  }

  public onItemClick(item: IListTreeItem): void {
    // if (item?.isFirstLevel) {
    //   this.expand(item);
    // } else {
    if (this.selectedItem?.id !== item.id) {
      if (this.selectedItem) {
        this.selectedItem.isSelected = false;
      }
      this.selectedItem = item;
      item.isSelected = true;
    } else {
      this.selectedItem = null;
      item.isSelected = false;
    }
    this.itemSelectedEmitter.emit(item);
    // }
  }

  public expand(item: IListTreeItem): void {
    item.expanded = !item.expanded;
  }

  public range(length: number): number[] {
    return Array.from(Array(length).keys());
  }

  public tabMargin(level: number): number {
    return level * 30;
  }

  public changeDir($event: Direction): void {
    this.currentDirection = $event;
  }

  public clickCheckbox(item: IListTreeItem): void {
    if (item === null) return;
    item.isCheckboxSelected = !item?.isCheckboxSelected ?? false;
    const index = this.selectedCheckbox?.findIndex((t) => t?.id === item?.id);
    if (index === -1) {
      this.selectedCheckbox.push(item);
      this.selectChild(item);
    } else {
      this.selectedCheckbox.splice(index, 1);
      this.deselectChild(item);
    }
    this.checkboxSelectedEmitter.emit(this.selectedCheckbox);
  }

  public dragItem(e: DragEvent, item: IListTreeItem): void {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setDragImage(this.dragImage.nativeElement as HTMLElement, 0, 0);
    this.dragTreeElement.emit(item);
  }

  private selectChild(item: IListTreeItem): void {
    item.isCheckboxSelected = true;
    item.children.forEach((c) => this.selectChild(c));
  }

  private deselectChild(item: IListTreeItem): void {
    item.isCheckboxSelected = false;
    const index = this.selectedCheckbox?.findIndex((t) => t?.id === item?.id);
    if (index !== -1) {
      this.selectedCheckbox.splice(index, 1);
    }
    item.children.forEach((c) => this.deselectChild(c));
  }

  private loadTrees(): void {
    this.isLoading = true;
    this.cdr.markForCheck();

    this.omTreeService.getFullTrees(this.cacheTree).subscribe(
      (trees) => {
        if (!trees) this.tree = [];
        this.tree = this.createListTrees(trees, true, undefined);
        if (this.selectedPathArray?.length) {
          this.expandAndSelect();
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      (error) => {
        console.log('error', error);
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    );
  }

  private createListTrees(tree: IResponseTreeItem[], isFirstLevel = false, modelParentGuid?: string): IListTreeItem[] {
    return tree
      .map((item) => this.createListTreeItem(item, isFirstLevel, modelParentGuid))
      .sort(this.sortListTreeItemsByName.bind(this));
  }

  private createListTreeItem(item: IResponseTreeItem, isFirstLevel: boolean, modelParentGuid?: string): IListTreeItem {
    return {
      id: item.guid,
      label: item.name,
      isFirstLevel,
      expanded: false,
      isSelected: false,
      isCheckboxSelected: false,
      value: item,
      modelParentGuid,
      children:
        item.children?.length > 0
          ? this.createListTrees(
            item.children,
            false,
            item.entityType === ObjectEntityTypeEnum.Model || item.entityType === ObjectEntityTypeEnum.ModelLink
              ? item.guid
              : modelParentGuid || undefined,
          ).sort(this.sortListTreeItemsByName.bind(this))
          : [],
    };
  }

  private unExpandAndUnSelect(): void {
    this.selectedCheckbox = [];
    this.selectedPathArray?.forEach((path, pathIndex) => {
      const path2: string[] = path
        .slice(1)
        .split('/')
        .map((p) => p.trim());
      let fItem: IListTreeItem | null = null;
      path2.forEach((p, i) => {
        if (i === 0) {
          fItem = this.findItemInTree(p, this.tree, false, pathIndex === 0, false, false);
        } else {
          fItem = this.findItemInTree(p, fItem?.children, true, pathIndex === 0, false, false);
        }
      });
    });
  }

  private expandAndSelect(): void {
    this.selectedPathArray?.forEach((path, pathIndex) => {
      const path2: string[] = path
        .slice(1)
        .split('/')
        .map((p) => p.trim());
      let fItem: IListTreeItem | null = null;
      path2.forEach((p, i) => {
        if (i === 0) {
          fItem = this.findItemInTree(p, this.tree, false, pathIndex === 0, true, true);
        } else {
          const isLast = i === path2.length - 1;
          fItem = this.findItemInTree(p, fItem?.children, isLast, pathIndex === 0, true, true);
          if (isLast && fItem) {
            this.selectedCheckbox.push(fItem);
          }
        }
      });
    });
  }

  private findItemInTree(
    path: string,
    data: IListTreeItem[],
    isLast: boolean = false,
    scrollTo: boolean = false,
    isExpand: boolean = true,
    isSelect: boolean = true,
  ): IListTreeItem | null {
    const item = data?.find((t) => t.label === path);
    if (!item) return null;
    if (scrollTo) {
      setTimeout(() => {
        this.scrollToElement(item?.id);
      }, 300);
    }
    if (isLast) {
      item.isCheckboxSelected = isSelect;
    } else {
      item.expanded = isExpand;
    }
    return item;
  }

  private scrollToElement(id: string): void {
    const el = document.getElementById(id);
    document.getElementById('scroll-port-objects-tree')?.scrollTo({ left: 0, top: el?.offsetTop, behavior: 'smooth' });
  }

  private sortListTreeItemsByName(a: IListTreeItem, b: IListTreeItem): number {
    if (a.label.toLowerCase() < b.label.toLowerCase()) {
      return -1;
    }
    if (a.label.toLowerCase() > b.label.toLowerCase()) {
      return 1;
    }
    return 0;
  }
}
