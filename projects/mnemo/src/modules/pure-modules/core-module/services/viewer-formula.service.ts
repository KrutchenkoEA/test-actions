/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { mxCell } from 'mxgraph';
import { BehaviorSubject, Subject } from 'rxjs';
import { IFormulaData, IFormulaDataBase, IUTTableCellData } from '../../../../models';

type CellValue = string | number | boolean; // import { CellValue } from '@univerjs/core';

@DecorateUntilDestroy()
@Injectable()
export class ViewerFormulaService {
  /** Идентификатор инициализации формул */
  public formulaInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public formulaInitActiveShapes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // region имена, источники данных
  /** мапа интервалов для формул */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public formulaMap: Map<string, any> = new Map();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public formulaMapActiveShapes: Map<string, any> = new Map();
  // endregion

  // region значения

  // endregion

  // region ссылки на объекты, ячейки
  /** Набор ячеек с формулами для мнемосхем */
  public formulaSetMnemo$: BehaviorSubject<Set<mxCell> | null> = new BehaviorSubject<Set<mxCell> | null>(
    new Set<mxCell>()
  );

  /** Набор ячеек с формулами для таблиц */
  public formulaCellsTableMap$: BehaviorSubject<Map<string, IUTTableCellData> | null> = new BehaviorSubject<Map<
    string,
    IUTTableCellData
  > | null>(new Map<string, IUTTableCellData>());

  /** Набор ячеек с формулами для дашбордов */
  public formulaSetActiveShapes$: BehaviorSubject<Set<IFormulaData> | null> =
    new BehaviorSubject<Set<IFormulaData> | null>(new Set<mxCell>());

  /** список объектов, без дубликатов, для графиков, без атрибута округления объединяет formulaSetMnemo$, formulaCellsTableMap$, formulaSetActiveShapes$ */
  public formulaObjectMap$: BehaviorSubject<Map<string, IFormulaData>> = new BehaviorSubject<Map<string, IFormulaData>>(
    new Map<string, IFormulaData>()
  );

  // endregion

  // region стримы обновления данных
  /** Стрим для пуша значений в компоненты */
  public updateFormulaData$: BehaviorSubject<unknown[]> = new BehaviorSubject<unknown[]>([]);

  /** Стрим для пуша значений плеера в компоненты */
  public updateFormulaDataPlayer$: Subject<unknown[]> = new Subject<unknown[]>();

  // endregion

  constructor() {
    this.formulaSetMnemo$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((cell) => {
        this.formulaObjectMap$.value.set(cell.formula, {
          formula: cell.formula,
          formulaInterval: cell.formulaInterval,
          unitName: cell.unitName,
          formulaValue: cell.formulaValue,
          value: cell.getValue(),
        });
      });
    });

    this.formulaCellsTableMap$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((cell) => {
        const custom = cell.custom as IFormulaDataBase;
        this.formulaObjectMap$.value.set(custom.formula, {
          formula: custom.formula,
          formulaInterval: custom.formulaInterval,
          unitName: custom.unitName,
          formulaValue: custom.formulaValue,
          value: cell.v as CellValue,
        });
      });
    });

    this.formulaSetActiveShapes$.pipe(takeUntilDestroyed(this)).subscribe((t) => {
      t?.forEach((source) => {
        this.formulaObjectMap$.value.set(source.formula, {
          formula: source.formula,
          formulaInterval: source.formulaInterval,
          unitName: source.unitName,
          formulaValue: source.formulaValue,
          value: 0,
        });
      });
    });
  }

  public cleanData(): void {
    this.formulaObjectMap$.value.clear();
    this.formulaMap.clear();
    this.formulaInit$.next(false);
    this.updateFormulaData$.next(null);
  }
}
