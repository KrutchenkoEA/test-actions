/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { mxCell } from 'mxgraph';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  IMnemoEvent,
  IOMAttributeAll,
  IOMAttributeValues,
  IOmCellObject,
  IOmCellObjectBase,
  IUTTableCellData,
  OmMapType,
} from '../../../../models';

type CellValue = string | number | boolean; // import { CellValue } from '@univerjs/core';
const OM_ATTR_MAP_KEYS: OmMapType[] = ['default', 'rounded', 'active-shapes'];

@DecorateUntilDestroy()
@Injectable()
// eslint-disable-next-line @typescript-eslint/naming-convention
export class ViewerOMService {
  /** Идентификатор инициализации атрибутов ом */
  public omAttrInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public omAttrInitActiveShapes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // region имена, источники данных
  /** мапа атрибутов ОМ <OmMapType, <elementId, [guis,guid,guid]>> */
  public omAttrMap: Map<OmMapType, Map<string, Set<string>>> = this.createMap<Set<string>>();
  // endregion

  // region значения
  /** мапа значений атрибутов ОМ <OmMapType, <elementId, <guid : values>>> */
  public omAttrMapData: Map<OmMapType, Map<string, Map<string, IOMAttributeValues[]>>> =
    this.createMap<Map<string, IOMAttributeValues[]>>();
  // endregion

  // region ссылки на объекты, ячейки
  /** Набор ячеек с атрибутами для мнемосхем */
  public omSetMnemo$: BehaviorSubject<Set<mxCell> | null> = new BehaviorSubject<Set<mxCell> | null>(new Set());

  /** Набор ячеек с атрибутами для таблиц */
  public omMapTable$: BehaviorSubject<Map<string, IUTTableCellData> | null> = new BehaviorSubject<Map<
    string,
    IUTTableCellData
  > | null>(new Map());

  /** Набор ячеек с атрибутами для активных элементов */
  public omSetActiveShapes$: BehaviorSubject<Set<IOmCellObject>> = new BehaviorSubject<Set<IOmCellObject>>(new Set());

  /** список объектов, без дубликатов, для графиков, без атрибута округления, объединяет omSetMnemo$ omMapTable$, omSetActiveShapes$ */
  public omObjectMap$: BehaviorSubject<Map<string, IOmCellObject>> = new BehaviorSubject<Map<string, IOmCellObject>>(
    new Map<string, IOmCellObject>()
  );

  // endregion

  // region стримы обновления данных
  /** Стрим для пуша значений в компоненты */
  public updateOmData$: BehaviorSubject<IOMAttributeAll[] | null> = new BehaviorSubject<IOMAttributeAll[]>([]);

  /** Стрим для пуша значений плеера в компоненты */
  public updateOmDataPlayer$: Subject<IOMAttributeValues[] | null> = new Subject<IOMAttributeValues[]>();

  /** Стрим для пуша значений в history.component в компоненты */
  public omEventsHistory$: BehaviorSubject<IMnemoEvent> = new BehaviorSubject<IMnemoEvent>(null);

  // endregion

  constructor() {
    this.omSetMnemo$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((cell) => {
        this.omObjectMap$.value.set(cell.attrGuid, {
          attrGuid: cell.attrGuid,
          attrName: cell.attrName,
          attrType: cell.attrType ?? 1,
          attrParentPath: cell.attrParentPath,
          attrParentGuid: cell.attrParentGuid,
          value: cell.getValue(),
        });
      });
    });

    this.omMapTable$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((cell) => {
        const custom = cell.custom as unknown as IOmCellObjectBase;
        this.omObjectMap$.value.set(custom.attrGuid, {
          attrGuid: custom.attrGuid,
          attrName: custom.attrName,
          attrType: custom.attrType ?? 1,
          attrParentPath: custom.attrParentPath,
          attrParentGuid: custom.attrParentGuid,
          value: cell.v as CellValue,
        });
      });
    });

    this.omSetActiveShapes$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((source) => {
        this.omObjectMap$.value.set(source.attrGuid, {
          attrGuid: source.attrGuid,
          attrName: source.attrName,
          attrType: source.attrType ?? 1,
          attrParentPath: source.attrParentPath,
          attrParentGuid: source.attrParentGuid,
          value: 0,
        });
      });
    });
  }

  public getOrCreateOmAttrMap(key: OmMapType, id: string): Set<string> {
    const currentMap = this.omAttrMap.get(key);
    if (!currentMap.get(id)) {
      currentMap.set(id, new Set());
    }
    const currentDataMap = this.omAttrMapData.get(key);
    if (!currentDataMap.get(id)) {
      currentDataMap.set(id, new Map());
    }
    return currentMap.get(id);
  }

  public cleanData(): void {
    this.omObjectMap$.value.clear();
    this.omAttrMap = this.createMap();
    this.omAttrMapData = this.createMap();
    this.omAttrInit$.next(false);
    this.updateOmData$.next(null);
  }

  private createMap<U>(): Map<OmMapType, Map<string, U>> {
    return new Map(
      OM_ATTR_MAP_KEYS.map((key) => {
        return [key, new Map<string, U>()];
      })
    );
  }
}
