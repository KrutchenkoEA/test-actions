/* eslint-disable import/no-extraneous-dependencies */
import { Overlay, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, Directive, ElementRef, HostListener, inject, Input, OnInit } from '@angular/core';
import { ShapePreviewTooltipComponent } from './shape-preview-tooltip.component';

// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[shapePreviewTooltip]' })
export class ShapePreviewTooltipDirective implements OnInit {
  private readonly overlay = inject(Overlay);
  private readonly overlayPositionBuilder = inject(OverlayPositionBuilder);
  private readonly elementRef = inject(ElementRef);

  @Input() public shapeTitle = '';
  @Input() public shapeSrc = '';

  private overlayRef: OverlayRef;

  public ngOnInit(): void {
    const positionStrategy = this.overlayPositionBuilder.flexibleConnectedTo(this.elementRef).withPositions([
      {
        originX: 'end',
        originY: 'center',
        overlayX: 'start',
        overlayY: 'center',
        offsetX: 50,
      },
    ]);

    this.overlayRef = this.overlay.create({ positionStrategy });
  }

  @HostListener('mouseenter')
  public show(): void {
    this.overlayRef?.detach();
    const tooltipRef: ComponentRef<ShapePreviewTooltipComponent> = this.overlayRef.attach(
      new ComponentPortal(ShapePreviewTooltipComponent)
    );
    tooltipRef.instance.shapeTitle = this.shapeTitle;
    tooltipRef.instance.shapeSrc = this.shapeSrc;
  }

  @HostListener('mouseleave')
  public hide(): void {
    this.overlayRef.detach();
  }
}
