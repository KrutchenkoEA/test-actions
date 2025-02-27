/* eslint-disable import/no-extraneous-dependencies */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { popup } from '../../../consts';
import { DataType, IOmTagModalInputConfig, ISourceModalResult, MethodType } from '../../../models';
import { POPUP_DIALOG_DATA, PopupReference } from '../../../services';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'om-tag-modal',
  templateUrl: './om-tag-modal.component.html',
  styleUrls: ['./om-tag-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [popup],
})
export class OmTagModalComponent implements OnInit {
  readonly data = inject<IOmTagModalInputConfig>(POPUP_DIALOG_DATA);
  private readonly popupRef = inject<PopupReference<OmTagModalComponent>>(PopupReference);

  public baseUrl: string = this.data.baseUrl;
  public multipleSelect: boolean = false;
  public multipleSelectObject: boolean = false;
  public selectedPathArray: string[] = [];
  public allowMethods: MethodType[] = ['tag', 'objectModel'];
  public enablePropTable: boolean = true;
  public selectedAttributes: ISourceModalResult | null = null;
  public currentMethod: MethodType = this.allowMethods[0];
  public filterAttributeType: DataType | null = null;
  public clear$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  public cacheTree: boolean = true;
  public cacheAttributes: boolean = true;

  public ngOnInit(): void {
    if (this.data?.multipleSelect) {
      this.multipleSelect = this.data.multipleSelect;
    }
    if (this.data?.multipleSelectObject) {
      this.multipleSelectObject = this.data.multipleSelectObject;
    }
    if (this.data?.allowMethods?.length) {
      this.allowMethods = this.data?.allowMethods;
    }
    if (this.data?.selectedPathArray?.length) {
      this.selectedPathArray = this.data?.selectedPathArray;
    }
    if (this.data?.enablePropTable) {
      this.enablePropTable = this.data?.enablePropTable;
    }
    if (this.data?.currentMethod) {
      this.currentMethod = this.data?.currentMethod;
    }
    if (this.data?.filterAttributeType) {
      this.filterAttributeType = this.data?.filterAttributeType;
    }
    if (this.data.cacheTree !== null) {
      this.cacheTree = this.data.cacheTree;
    }
    if (this.data.cacheTree !== null) {
      this.cacheAttributes = this.data.cacheAttributes;
    }
  }

  public selectAttributes(attr: ISourceModalResult): void {
    this.selectedAttributes = attr;
  }

  public onApply(): void {
    this.popupRef.close(this.selectedAttributes);
  }

  public onClose(): void {
    this.popupRef.close(null);
  }

  public onClear(): void {
    this.clear$.next(!this.clear$.getValue());
  }
}
