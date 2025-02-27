/* eslint-disable import/no-extraneous-dependencies */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  TrackByFunction,
} from '@angular/core';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { BehaviorSubject, forkJoin, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { sortByNameFunction } from '../../../../functions';
import { DataType, EmitterNameType, IListTreeItem, IObjectAttribute, ISourceModalResult } from '../../../../models';
import { OmTreeService } from '../om-tree.service';
import { dataTypeMap } from './data-type.const';

@DecorateUntilDestroy()
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'objects-list-wrapper',
  templateUrl: './objects-list-wrapper.component.html',
  styleUrls: ['./objects-list-wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectsListWrapperComponent {
  private readonly omTreeService = inject(OmTreeService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() public baseUrl: string = '';
  @Input() public multipleSelect: boolean = false;
  @Input() public multipleSelectObject: boolean = false;
  @Input() public selectedPathArray: string[] = [];
  @Input() public enablePropTable: boolean = true;
  @Input() public cacheTree: boolean = true;
  @Input() public cacheAttributes: boolean = true;
  @Output() public selectedEmitter: EventEmitter<ISourceModalResult> = new EventEmitter<ISourceModalResult>();

  public isLoadingPropTable: boolean = false;
  public isLoadingTree$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public clear$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  public newSelectedPathArray$: Subject<string[]> = new Subject<string[]>();
  public attributes: IObjectAttribute[] = [];
  public selectedObject: IListTreeItem | null = null;
  public selectedDataType: {
    value: number | null;
    emitterName: EmitterNameType;
    emitterFunc?: Function;
  } = dataTypeMap.get('Тег');

  private selectedAttributes: IObjectAttribute[] | null = [];

  @Input()
  public set filterAttributeType(key: DataType | null) {
    if (!key) {
      this.selectedDataType = dataTypeMap.get('Тег');
    } else {
      this.selectedDataType = dataTypeMap.get(key);
    }
  }

  @Input()
  public set newSelectedPathArray(path: string[]) {
    this.newSelectedPathArray$.next(path);
  }

  @Input()
  public set clear(v: boolean | null) {
    this.selectedAttributes.forEach((t) => {
      t.isSelected = false;
    });
    if (v === null) return;
    this.clear$.next(v);
  }

  @Input()
  public set newSelection(val: { source: { attrGuid: string }[]; key: EmitterNameType }) {
    if (!val) return;
    const guidKey = val.key === 'attributes' ? 'attrGuid' : 'guid';
    this.selectedAttributes = this.selectedAttributes?.filter((a) => {
      const res = val.source?.find((attr) => a.guid === attr[guidKey]);
      if (!res) {
        a.isSelected = false;
      }
      return !!res;
    });
  }

  public selectObject(item: IListTreeItem): void {
    this.selectedObject = item?.id === this.selectedObject?.id ? null : item;
    this.attributes = [];
    if (this.selectedObject === null) return;
    this.isLoadingPropTable = true;
    this.loadNotFirstLevelObjectOrModel(this.selectedObject);
  }

  public selectCheckbox(items: IListTreeItem[] | null): void {
    if (!items?.length) {
      this.selectedEmitter.emit({
        multiple: this.multipleSelect,
        objectsPathArr: [],
        tagsFromObjects: [],
      });
      return;
    }

    this.selectedObject = null;
    this.isLoadingTree$.next(true);

    const allSelectedObject: IListTreeItem[] = items.map((item) => this.addId(item)).flat(1);

    forkJoin(allSelectedObject.map((item) => this.omTreeService.getObjectAttributes(item.id, this.cacheAttributes)))
      .pipe(
        map((r) => {
          const props = [];
          r.forEach((detailedObjects) => {
            const parentItem = allSelectedObject.find((ilti) => ilti.id === detailedObjects.guid);
            if (parentItem) {
              parentItem.value.path = detailedObjects.path;
            }
            const prop = detailedObjects?.attributes?.filter((p) => p.dataType === 2 && p.inputData?.length && p?.guid);
            if (prop?.length) {
              props.push(prop);
            }
          });
          return props.flat(1);
        })
      )
      .subscribe({
        next: (res: IObjectAttribute[]) => {
          const itemsPath: string[] = [];
          items.forEach((t) => {
            if (t?.value) {
              itemsPath.push(t.value.path);
            }
          });
          this.selectedEmitter.emit({
            multiple: this.multipleSelect,
            objectsPathArr: itemsPath,
            tagsFromObjects: res,
          });
          this.isLoadingTree$.next(false);
        },
        error: (e) => {
          console.error(e);
          this.isLoadingTree$.next(false);
        },
      });
  }

  public addId(item: IListTreeItem): IListTreeItem[] {
    let res: IListTreeItem[] = [];
    if (item?.isFirstLevel) {
      res = item.children.map((c) => this.addId(c)).flat(1);
    } else {
      res = [item, ...item.children.map((c) => this.addId(c)).flat(1)];
    }
    return res;
  }

  public clickAttribute(tag: IObjectAttribute): void {
    if (this.multipleSelect) {
      this.multiSelect(tag);
    } else {
      this.singleSelect(tag);
    }
  }

  public attributeById: TrackByFunction<IObjectAttribute> = (index: number, property: IObjectAttribute) =>
    property.guid;

  public isDisabledAttribute(attribute: IObjectAttribute): boolean {
    switch (this.selectedDataType.emitterName) {
      case 'tags':
        return !(attribute?.guid && attribute?.inputData?.length);
      case 'constants':
      case 'formulas':
      case 'urls':
      case 'attributes':
        return !attribute?.guid;
      default:
        return true;
    }
  }

  private singleSelect(attribute: IObjectAttribute): void {
    if (attribute.guid === this.selectedAttributes[0]?.guid) {
      attribute.isSelected = false;
      this.selectedAttributes = [];
    } else {
      if (this.selectedAttributes[0]?.guid) {
        this.selectedAttributes[0].isSelected = false;
      }
      attribute.isSelected = true;
      this.selectedAttributes = [attribute];
    }
    this.emitAttributes();
    this.cdr.markForCheck();
  }

  private multiSelect(attribute: IObjectAttribute): void {
    const index = this.selectedAttributes.findIndex((p) => p.guid === attribute.guid);
    if (index === -1) {
      attribute.isSelected = true;
      this.selectedAttributes.push(attribute);
    } else {
      attribute.isSelected = false;
      this.selectedAttributes.splice(index, 1);
    }
    this.emitAttributes();
    this.cdr.markForCheck();
  }

  private loadNotFirstLevelObjectOrModel(item: IListTreeItem): void {
    this.omTreeService.getObjectAttributes(item.value.guid, this.cacheAttributes).subscribe({
      next: (detailedObjects) => {
        item.value.path = detailedObjects.path;

        this.attributes =
          this.selectedDataType.value == null
            ? detailedObjects?.attributes
            : detailedObjects?.attributes?.filter((p) => p.dataType === this.selectedDataType.value);
        this.attributes?.sort((a, b) => sortByNameFunction(a, b));

        this.isLoadingPropTable = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.isLoadingPropTable = false;
        this.cdr.markForCheck();
      },
    });
  }

  private emitAttributes(): void {
    if (!this.selectedAttributes?.length) {
      this.selectedEmitter.emit({
        multiple: this.multipleSelect,
        [this.selectedDataType.emitterName]: [],
      });
      return;
    }

    this.selectedEmitter.emit({
      multiple: this.multipleSelect,
      [this.selectedDataType.emitterName]: this.selectedDataType.emitterFunc(
        this.selectedAttributes,
        this.selectedObject.value.guid,
        this.selectedObject.value.path
      ),
    });
  }
}
