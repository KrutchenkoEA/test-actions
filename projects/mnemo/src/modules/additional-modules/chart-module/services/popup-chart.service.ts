/* eslint-disable import/no-extraneous-dependencies */
import { OverlayRef } from '@angular/cdk/overlay';
/* eslint-disable import/no-cycle */
import { inject, Injectable } from '@angular/core';
import { mxCell } from 'mxgraph';
import { BehaviorSubject, Subject } from 'rxjs';
import { IFormulaData, IPopupForm, IVCLayerDataLineViewOptions } from '../../../../models';
import { PopupReference } from '../../../../services';
import { ChartWrapComponent } from '../components';
import { ChartOptionsService } from './chart-options.service';

/**  @deprecated use MnemoChartModule */
@Injectable()
export class PopupChartService {
  private readonly chartOptionsService = inject(ChartOptionsService);

  public layerNames: string[] = ['tag', 'omAttr', 'formula'];
  public lineDefaultOptions: IVCLayerDataLineViewOptions = this.chartOptionsService.getDefaultLayerDataOptions();

  public chartsData: Map<string, string> = new Map<string, string>();
  public chartsDataChanged: Map<string, Subject<IPopupForm>> = new Map<string, Subject<IPopupForm>>();

  public popupContainer: Map<
    string,
    {
      popupRef: PopupReference<ChartWrapComponent>;
      overlayRef: OverlayRef;
    }
  > = new Map<string, { popupRef: PopupReference<ChartWrapComponent>; overlayRef: OverlayRef }>();

  public firstChartId = 'first-popup-chart';
  public tooltipChartData$: BehaviorSubject<mxCell | Partial<IFormulaData>> = new BehaviorSubject<
    mxCell | Partial<IFormulaData>
  >(null);
}
