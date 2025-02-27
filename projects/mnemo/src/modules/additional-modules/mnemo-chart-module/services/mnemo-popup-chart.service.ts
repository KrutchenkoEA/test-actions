/* eslint-disable import/no-extraneous-dependencies */
import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';
import { mxCell } from 'mxgraph';
import { BehaviorSubject } from 'rxjs';
import { IFormulaData, IMnemoChartPopupForm } from '../../../../models';
import { PopupReference } from '../../../../services';
import { MnemoChartWrapComponent } from '../components';

@Injectable()
export class MnemoPopupChartService {
  public chartsDataChanged: Map<string, BehaviorSubject<IMnemoChartPopupForm>> = new Map<
    string,
    BehaviorSubject<IMnemoChartPopupForm>
  >();

  public popupContainer: Map<
    string,
    {
      popupRef: PopupReference<MnemoChartWrapComponent>;
      overlayRef: OverlayRef;
    }
  > = new Map<string, { popupRef: PopupReference<MnemoChartWrapComponent>; overlayRef: OverlayRef }>();

  public firstChartId = 'popup-chart';

  public tooltipChartData$: BehaviorSubject<mxCell | Partial<IFormulaData>> = new BehaviorSubject<
    mxCell | Partial<IFormulaData>
  >(null);
}
