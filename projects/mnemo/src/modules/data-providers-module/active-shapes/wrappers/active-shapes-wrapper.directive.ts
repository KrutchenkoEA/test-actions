/* eslint-disable import/no-extraneous-dependencies */
import { Directive, inject, Injector, Type } from '@angular/core';
import { IActiveShapesElement, IDashboardItemOptions, ViewElementTypeEnum } from '../../../../models';
import { ACTIVE_SHAPES_PURE } from '../active-shapes-pure.elements';
import { ACTIVE_SHAPES_ITEM_ID, ACTIVE_SHAPES_ITEM_OPTIONS } from '../active-shapes.tokens';

@Directive({
  selector: '[tlMnemoActiveShapeWrapperDirective]',
  standalone: true,
})
export class ActiveShapesWrapperDirective {
  public elements: IActiveShapesElement[] = ACTIVE_SHAPES_PURE;

  public injector: Injector = inject(Injector);

  public getComponentByType(type: ViewElementTypeEnum): Type<unknown> {
    const element = this.elements.find((item) => item.type === type);
    return element.component;
  }

  public getInjector = (id: string, options: IDashboardItemOptions): Injector => {
    return Injector.create({
      providers: [
        {
          provide: ACTIVE_SHAPES_ITEM_ID,
          useValue: id,
        },
        {
          provide: ACTIVE_SHAPES_ITEM_OPTIONS,
          useValue: options,
        },
      ],
      parent: this.injector,
    });
  };
}
