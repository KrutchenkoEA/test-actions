/* eslint-disable import/no-extraneous-dependencies */
import { BehaviorSubject } from 'rxjs';
import { DataItemTypeEnum, IActiveShapesElement, IDashboardItem, ViewElementTypeEnum } from '../../../../models';

export abstract class ActiveShapesWrapperAbstract {
  public abstract item: Partial<IDashboardItem>;
  public abstract elements: IActiveShapesElement[];

  public abstract size: { width: number; height: number };

  public abstract viewType: ViewElementTypeEnum;
  public abstract dataType: DataItemTypeEnum;

  public abstract exampleView: boolean;

  public abstract isVisible$: BehaviorSubject<boolean>;
}
