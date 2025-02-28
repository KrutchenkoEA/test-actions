/* eslint-disable import/no-extraneous-dependencies */
import { Directive, inject, OnInit } from '@angular/core';
import { STORE_GLOBAL, StoreService, takeUntilDestroyed } from '@tl-platform/core';
import { IMnemoChartRequestOptions, IMnemoChartViewOptions } from '../../../../models';
import { MnemoOptionsFormBaseDirective } from '../../../pure-modules';
import { ACTIVE_SHAPES_DATA_MAPPING_REQUEST_OPTIONS, ACTIVE_SHAPES_DATA_MAPPING_VIEW_OPTIONS } from '../consts';

@Directive({
  selector: '[tlMnemoActiveShapeOptionsBase]',
  standalone: true,
})
export class ActiveShapesOptionsBaseDirective<U> extends MnemoOptionsFormBaseDirective<U> implements OnInit {
  public store = inject<StoreService>(STORE_GLOBAL);

  public ngOnInit(): void {
    super.ngOnInit();

    const requestOptions = this.store.getCurrent<IMnemoChartRequestOptions>(ACTIVE_SHAPES_DATA_MAPPING_REQUEST_OPTIONS);
    if (requestOptions) {
      this.requestControl.patchValue(true, { emitEvent: false });
      this.requestForm.patchValue(requestOptions, { emitEvent: false });
    }

    const viewOptions = this.store.getCurrent<IMnemoChartViewOptions>(ACTIVE_SHAPES_DATA_MAPPING_VIEW_OPTIONS);
    if (viewOptions) {
      this.requestControl.patchValue(true, { emitEvent: false });
      this.viewForm.patchValue(viewOptions, { emitEvent: false });
    }

    this.requestForm.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value: IMnemoChartRequestOptions) => {
      this.store.setState<IMnemoChartRequestOptions>(
        ACTIVE_SHAPES_DATA_MAPPING_REQUEST_OPTIONS,
        this.requestControl.value ? value : null
      );
    });
    this.viewForm.valueChanges.pipe(takeUntilDestroyed(this)).subscribe((value: IMnemoChartViewOptions) => {
      this.store.setState<IMnemoChartViewOptions>(ACTIVE_SHAPES_DATA_MAPPING_VIEW_OPTIONS, value);
    });
  }
}
