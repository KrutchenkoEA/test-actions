/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { IOMAttributeValues, ITagsValues, ITimeSelect } from '../../../../models';
import { ViewerFormulaService } from '../services/viewer-formula.service';
import { ViewerOMService } from '../services/viewer-om.service';
import { ViewerTagService } from '../services/viewer-tag.service';

@Injectable()
export class PlayerService {
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);

  public dateObj: ITimeSelect = null;
  public tagMap: Map<
    string,
    {
      defaultFormat: Map<number, ITagsValues>;
      withFormat: Map<number, ITagsValues>;
    }
  > = new Map();

  public omMap: Map<
    string,
    {
      defaultFormat: Map<number, IOMAttributeValues>;
      withFormat: Map<number, IOMAttributeValues>;
    }
  > = new Map();

  public dateObjChanged$: BehaviorSubject<ITimeSelect> = new BehaviorSubject<ITimeSelect>(this.dateObj);

  public playerInterval$ = null;
  public playerCheckInterval$ = null;
  public playerAcceleration: number = 1;
  public playerIsLoop: boolean = false;
  public isDataDownloaded: boolean = false;
  public readonly currentPositionChanged$: BehaviorSubject<number> = new BehaviorSubject(0);
  public readonly checkBuffer$: Subject<number> = new Subject<number>();
  public readonly buttonPeriodDelta = 4;
  private readonly playerAccelerationArr: number[] = [0.5, 1, 2, 4, 8, 16, 32];

  constructor() {
    this.createTimeObject();
  }

  public _playPlayer(time: number = 1000): void {
    if (this.playerInterval$) {
      this._stopPlayer();
    } else {
      if (this.dateObj.currentIndex === this.dateObj.periodToIndex) {
        this.refreshCurrentPosition();
      }

      if (this.playerAcceleration > 2) {
        this.playerCheckInterval$ = setInterval(() => this.checkBuffer$.next(Date.now()), 15 * 1000);
      }
      this.playerInterval$ = setInterval(() => this.pushData(), time / this.playerAcceleration);
    }
  }

  public _stopPlayer(): void {
    this.isDataDownloaded = false;
    clearInterval(this.playerInterval$);
    clearInterval(this.playerCheckInterval$);
    this.playerInterval$ = null;
    this.playerCheckInterval$ = null;
  }

  public _clearPlayer(): void {
    this._stopPlayer();
    this.tagMap.clear();
    this.omMap.clear();
  }

  public nextIndexTrigger(): void {
    this.dateObj.current = this.dateObj.periodArr[this.dateObj.currentIndex].getTime();
    this.currentPositionChanged$.next(this.dateObj.currentIndex);
  }

  public setTimeObject(start: Date = null, end: Date = null, clear: boolean = false): void {
    let length: number;
    let step: number;
    const bufferStep = 5 * 60; // 5 минут

    if (start && end) {
      length = Math.round((end.getTime() - start.getTime()) / 1000);
      step = Math.round(length * 0.1);
    } else {
      const hoursDelta = 8; // 8 часов - разница между начальной и конечной датой
      length = hoursDelta * 60 * 60; // 8 часов = 28800
      step = 2 * 60; // 2 минуты стартовый интервал
      start = new Date(new Date().setHours(new Date().getHours() - hoursDelta));
    }

    if (clear) {
      this.clearDataMap();
    }

    const dates = Array.from({ length: length + 1 }, (n, i) => {
      return new Date(new Date(start).setSeconds(i, 0));
    });

    this.dateObj = {
      periodFrom: dates[0],
      periodFromIndex: 0,
      periodTo: dates[dates.length - 1],
      periodToIndex: length,

      periodArr: dates,
      currentIndex: 0,
      current: dates[0].getTime(),

      downloadedFromIndex: 0,
      downloadedToIndex: step,

      bufferStep,
      bufferFromIndex: 0,
      bufferToIndex: 0,

      isBufferDownloaded: false,
      timeTicks: [0, 0.25, 0.5, 0.75, 1].map((position) => dates[Math.round(length * position)]),
    };

    this.playerIsLoop = false;

    this.dateObjChanged$.next(this.dateObj);
  }

  public addDownloaded(): void {
    this.dateObj.downloadedToIndex = this.dateObj.bufferToIndex;
  }

  public addBufferTime(): void {
    this.dateObj.bufferFromIndex = this.dateObj.bufferToIndex;

    if (this.dateObj.bufferToIndex + this.dateObj.bufferStep > this.dateObj.periodToIndex) {
      this.dateObj.bufferToIndex = this.dateObj.periodToIndex;
      this.dateObj.isBufferDownloaded = true;
    } else {
      this.dateObj.bufferToIndex += this.dateObj.bufferStep;
    }
  }

  public deleteBufferTime(): void {
    this.dateObj.bufferToIndex = this.dateObj.bufferFromIndex;
    this.dateObj.bufferFromIndex -= this.dateObj.bufferStep;
  }

  public getCurrentPositionPercent(): number {
    return (
      (100 * (this.dateObj.currentIndex - this.dateObj.downloadedFromIndex)) /
      (this.dateObj.downloadedToIndex - this.dateObj.downloadedFromIndex)
    );
  }

  // region buttons events
  public refreshCurrentPosition(): void {
    this._stopPlayer();
    this.setTimeObject(null, null, true);
  }

  public backCurrentPosition(): void {
    if (this.dateObj.currentIndex - this.dateObj.bufferStep > this.dateObj.downloadedFromIndex) {
      this.dateObj.currentIndex -= this.dateObj.bufferStep;
    } else {
      this.dateObj.currentIndex = this.dateObj.downloadedFromIndex;
    }
    this.nextIndexTrigger();
  }

  public backPeriod(): void {
    this._stopPlayer();

    const oldDateFrom = new Date(this.dateObj.periodFrom);
    const dateFrom = new Date(
      new Date(oldDateFrom.setHours(this.dateObj.periodFrom.getHours() - this.buttonPeriodDelta)).setMilliseconds(0),
    );
    const clearCondition: boolean =
      this.dateObj.periodArr.length > 50000 && this.dateObj.periodTo.getTime() - dateFrom.getTime() > 10000000;

    this.setTimeObject(dateFrom, this.dateObj.periodTo, clearCondition);
    this._playPlayer();
  }

  public forwardPeriod(): void {
    this._stopPlayer();

    const dataNow = Date.now();
    const oldDateTo = new Date(this.dateObj.periodTo);
    const newDateTo = new Date(
      oldDateTo.setHours(this.dateObj.periodTo.getHours() + this.buttonPeriodDelta),
    ).setMilliseconds(0);
    const dateTo = new Date(newDateTo > dataNow ? dataNow : newDateTo);
    const clearCondition: boolean =
      this.dateObj.periodArr.length > 50000 && dateTo.getTime() - this.dateObj.periodFrom.getTime() > 10000000;

    this.setTimeObject(this.dateObj.periodFrom, dateTo, clearCondition);
    this._playPlayer();
  }

  public forwardCurrentPosition(): void {
    if (this.dateObj.currentIndex + this.dateObj.bufferStep > this.dateObj.periodToIndex) {
      this.dateObj.currentIndex = this.dateObj.periodToIndex;
      this._stopPlayer();
    } else {
      this.dateObj.currentIndex += this.dateObj.bufferStep;
    }
    this.nextIndexTrigger();
  }

  public changePlayerLoop(): void {
    this.playerIsLoop = !this.playerIsLoop;
  }

  public changePlayerAcceleration(): void {
    this._stopPlayer();
    const index = this.playerAccelerationArr.findIndex((d) => d === this.playerAcceleration);
    if (index === this.playerAccelerationArr.length - 1) {
      // eslint-disable-next-line prefer-destructuring
      this.playerAcceleration = this.playerAccelerationArr[0];
    } else {
      this.playerAcceleration = this.playerAccelerationArr[index + 1];
    }
    this._playPlayer();
  }

  public changeCurrentPositionCursor(v: number): void {
    const bufferDelta = v - 100;
    const newDate = this.dateObj.periodArr[v].setSeconds(0, 0);
    let index = this.dateObj.periodArr.findIndex((d) => d.getTime() === newDate);
    if (index < 5) {
      index = 5;
    }
    this.dateObj.currentIndex = index - 5;
    this.dateObj.current = this.dateObj.periodArr[this.dateObj.currentIndex].getTime();
    this.dateObj.bufferFromIndex = bufferDelta - this.dateObj.bufferStep;
    this.dateObj.bufferToIndex = bufferDelta;
    this.dateObj.downloadedFromIndex = bufferDelta;
    this.dateObj.downloadedToIndex = bufferDelta;
  }

  // endregion

  private pushData(): void {
    const tagValues: ITagsValues[] = [];
    this.tagMap.forEach((tag) => {
      const defaultFormat = tag.defaultFormat.get(this.dateObj.current);
      const withFormat = tag.withFormat.get(this.dateObj.current);
      if (defaultFormat) {
        tagValues.push({
          guid: defaultFormat?.id,
          name: defaultFormat?.name,
          time: defaultFormat?.time,
          status: defaultFormat?.status,
          val: defaultFormat?.val,
          withFormat: false,
        });
      }
      if (withFormat) {
        tagValues.push({
          guid: withFormat?.id,
          name: withFormat?.name,
          time: withFormat?.time,
          status: withFormat?.status,
          val: withFormat?.val,
          withFormat: true,
        });
      }
    });

    const omValues: IOMAttributeValues[] = [];
    this.omMap.forEach((attr) => {
      const defaultFormat = attr.defaultFormat.get(this.dateObj.current);
      const withFormat = attr.withFormat.get(this.dateObj.current);
      if (defaultFormat) {
        omValues.push({
          value: defaultFormat?.value,
          valueType: defaultFormat?.valueType,
          timeStamp: defaultFormat?.timeStamp,
          isGood: defaultFormat?.isGood,
          attributeId: defaultFormat?.attributeId,
          withFormat: false,
        });
      }
      if (withFormat) {
        omValues.push({
          value: withFormat?.value,
          valueType: withFormat?.valueType,
          timeStamp: withFormat?.timeStamp,
          isGood: withFormat?.isGood,
          attributeId: withFormat?.attributeId,
          withFormat: true,
        });
      }
    });

    this.dateObj.currentIndex += 1;
    this.nextIndexTrigger();

    if (this.dateObj.currentIndex >= this.dateObj.periodToIndex) {
      if (this.playerIsLoop) {
        this.dateObj.currentIndex = 0;
      } else {
        this._stopPlayer();
      }
    } else {
      this.viewerTagService.updateTagDataPlayer$.next(tagValues);
      this.viewerOMService.updateOmDataPlayer$.next(omValues);
      this.viewerFormulaService.updateFormulaDataPlayer$.next([]);
    }
  }

  private createTimeObject(): void {
    const bufferStep = 5 * 60; // 5 минут
    this.dateObj = {
      periodFrom: new Date(),
      periodFromIndex: 0,
      periodTo: new Date(),
      periodToIndex: 0,

      periodArr: [],
      currentIndex: 0,
      current: 0,

      downloadedFromIndex: 0,
      downloadedToIndex: 0,

      bufferStep,
      bufferFromIndex: 0,
      bufferToIndex: 0,

      isBufferDownloaded: false,
      timeTicks: [],
    };
  }

  private clearDataMap(): void {
    this.viewerTagService.tagsNames$?.value?.map((tag) =>
      this.tagMap.set(tag.name, {
        defaultFormat: new Map(),
        withFormat: new Map(),
      }),
    );

    this.viewerOMService.omObjectMap$.value.forEach((obj) => {
      this.omMap.set(obj.attrGuid, {
        defaultFormat: new Map(),
        withFormat: new Map(),
      });
    });
  }
}
