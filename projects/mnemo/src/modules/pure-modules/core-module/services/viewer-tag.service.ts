/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { TluiChartLineDataSimple } from '@tl-platform/ui';
import { mxCell } from 'mxgraph';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { IMnemoEvent, ITableParams, ITagsMeta, ITagsValues, IUTTableCellData, IViewerTag } from '../../../../models';
import { RtdbTagApiService } from '../../../../services';
import { ViewerRefreshService } from './viewer-refresh.service';

@DecorateUntilDestroy()
@Injectable()
export class ViewerTagService {
  public rtdbTagApiService = inject(RtdbTagApiService);
  public viewerRefreshService = inject(ViewerRefreshService);

  /** Идентификатор инициализации тегов */
  public isTagsInit$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isTagsInitActiveShapes$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isTagsStart$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  // region имена, источники данных
  /** Полный список тегов с флагами */
  public tagsNames$: BehaviorSubject<IViewerTag[] | null> = new BehaviorSubject<IViewerTag[] | null>(null);
  public tagsNamesActiveShapes$: BehaviorSubject<IViewerTag[] | null> = new BehaviorSubject<IViewerTag[] | null>(null);

  /** Фильтрованные от дубликатов имена тегов */
  public tagsNamesOnly$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  public tagsNamesOnlyActiveShapes$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  public tagsNamesOnlyAll$: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);

  /** Мапа соответствия имени тега id */
  public tagNameIdMap: Map<string, number> = new Map();

  /** Мапа соответствия имени тега guid */
  public tagNameGuidMap: Map<string, number> = new Map();
  // endregion

  // region значения

  /** мапа значений тегов */
  public tagNameDataMap: Map<string, TluiChartLineDataSimple[]> = new Map<string, TluiChartLineDataSimple[]>();

  // endregion

  // region ссылки на объекты, ячейки
  /** Набор ячеек с тегами для мнемосхем */
  public tagCellsMnemoSet: Set<mxCell> = new Set();

  /** Набор ячеек с тегами для таблиц */
  public tagCellsTableMap: Map<string, IUTTableCellData> = new Map<string, IUTTableCellData>();

  // endregion

  // region стримы обновления данных
  /** Стрим для пуша значений в компоненты c WS */
  public updateTagData$: BehaviorSubject<ITagsValues[]> = new BehaviorSubject<ITagsValues[]>([]);

  /** Стрим для пуша значений плеера в компоненты */
  public updateTagDataPlayer$: Subject<ITagsValues[]> = new Subject<ITagsValues[]>();

  /** Стрим для пуша значений c метаинформацией в компоненты */
  public updateTagsMetaInfo$: BehaviorSubject<null> = new BehaviorSubject<null>(null);

  /** Мапа метаинформации тегов */
  public tagMetaInfoMap: Map<string, ITagsMeta> = new Map();

  /** Стрим для пуша значений в history.component в компоненты */
  public tagEventsHistory$: BehaviorSubject<IMnemoEvent> = new BehaviorSubject<IMnemoEvent>(null);
  // endregion

  // region deprecated

  /**  @deprecated мапа параметров старой реализации таблицы */
  public tagTableParamsMap: Map<string, ITableParams> = new Map(); // tagA1Name: ITableParams
  // endregion

  constructor() {
    this.tagsNames$
      .pipe(takeUntilDestroyed(this))
      .subscribe((t) => this.tagsNamesOnly$.next(Array.from(new Set(t?.map((v) => v.name)))));

    this.tagsNamesActiveShapes$
      .pipe(takeUntilDestroyed(this))
      .subscribe((t) => this.tagsNamesOnlyActiveShapes$.next(Array.from(new Set(t?.map((v) => v.name)))));

    combineLatest([this.tagsNamesOnly$, this.tagsNamesOnlyActiveShapes$])
      .pipe(takeUntilDestroyed(this))
      .subscribe((t) => {
        this.tagsNamesOnlyAll$.next(t.flat());
      });
  }

  public cleanData(): void {
    this.tagsNames$.next([]);
    this.tagsNamesActiveShapes$.next([]);

    this.updateTagData$.next(null);
    this.updateTagDataPlayer$.next(null);
    this.updateTagsMetaInfo$.next(null);
    this.tagEventsHistory$.next(null);

    this.tagCellsMnemoSet.clear();
    this.tagCellsTableMap.clear();
    this.tagTableParamsMap.clear();

    this.isTagsInit$.next(false);
    this.isTagsInitActiveShapes$.next(false);
    this.isTagsStart$.next(false);
  }
}
