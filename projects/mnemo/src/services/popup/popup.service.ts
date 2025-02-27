/* eslint-disable import/no-extraneous-dependencies */
import { ESCAPE } from '@angular/cdk/keycodes';
import {
  ComponentType,
  FlexibleConnectedPositionStrategy,
  GlobalPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { inject, Injectable, InjectionToken, Injector } from '@angular/core';
import { fromEvent, merge } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { IPopupConfiguration } from '../../models';
import { PopupReference } from './popup-reference';

export const POPUP_DIALOG_DATA = new InjectionToken<string>('POPUP_DIALOG_DATA');

@Injectable()
export class PopupService {
  private readonly overlay = inject(Overlay);
  private readonly injector = inject(Injector);

  private overlayRef: OverlayRef | null = null;

  public updatePopupPosition(): void {
    this.overlayRef?.updatePosition();
  }

  public removeOverlay(): void {
    this.overlayRef?.dispose();
  }

  public open<T = unknown, V = unknown>(
    component: ComponentType<T>,
    data: V,
    config: IPopupConfiguration = {}
  ): { popupRef: PopupReference<T>; overlayRef: OverlayRef } {
    const overlayRef = this.createOverlay(config);
    const popupRef = new PopupReference<T>(overlayRef);
    this.overlayRef = overlayRef;

    this.attachDialogContainer(overlayRef, component, data, popupRef);

    merge(
      fromEvent(document, 'keydown').pipe(
        takeUntil(popupRef.afterClosed()),
        filter((event: KeyboardEvent) => event.keyCode === ESCAPE)
      ),
      overlayRef.backdropClick()
    ).subscribe(() => popupRef.close(null));

    return { popupRef, overlayRef };
  }

  private createOverlay(config: IPopupConfiguration): OverlayRef {
    const overlayConfig = this.getOverlayConfig(config);

    return this.overlay.create(overlayConfig);
  }

  private attachDialogContainer<T>(
    overlayRef: OverlayRef,
    component: ComponentType<T>,
    data: unknown,
    popupRef: PopupReference<T>
  ): T {
    const injector = Injector.create({
      providers: [
        { provide: PopupReference, useValue: popupRef },
        { provide: POPUP_DIALOG_DATA, useValue: data },
      ],
      parent: this.injector,
    });
    const containerPortal = new ComponentPortal(component, null, injector);

    return overlayRef.attach(containerPortal).instance;
  }

  private getOverlayConfig({
    origin,
    width,
    height,
    positions,
    hasBackdrop,
    panelClass,
  }: IPopupConfiguration): OverlayConfig {
    const scrollStrategy = this.overlay.scrollStrategies.reposition();
    let positionStrategy: GlobalPositionStrategy | FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    if (origin) {
      positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(origin)
        .withFlexibleDimensions(true)
        .withPush(true)
        .withViewportMargin(0)
        .withPositions(
          positions ?? [
            {
              originX: 'end',
              originY: 'top',
              overlayX: 'end',
              overlayY: 'top',
            },
          ]
        );
    }

    return new OverlayConfig({
      panelClass: panelClass ?? ['tl-mnemo-popover-transparent'],
      hasBackdrop: hasBackdrop ?? true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      height: height ?? 'auto',
      width: width ?? 'auto',
      scrollStrategy,
      positionStrategy,
    });
  }
}
