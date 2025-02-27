/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslocoDirective } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { TluiButtonModule, TluiFormFieldModule, TluiSliderModule, TluiToggleModule } from '@tl-platform/ui';
import { SvgIconComponent } from 'angular-svg-icon';
import { BehaviorSubject, combineLatest, debounceTime, filter, Observable } from 'rxjs';
import { PlayerButtonType } from '../../../models';
import { MnemoLoggerService, PopupService } from '../../../services';
import {
  PlayerModeService,
  PlayerService,
  ViewerFormulaService,
  ViewerOMService,
  ViewerService,
  ViewerTagService,
} from '../../pure-modules';
import { ViewerPlayerUserDateComponent } from './components/viewer-player-user-date/viewer-player-user-date.component';
import { ViewerBufferFormulaService, ViewerBufferOmService, ViewerBufferTagService } from './services';
import { ViewerBufferPlayerProviders } from './viewer-buffer-player.providers';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-viewer-buffer-player',
  templateUrl: './viewer-buffer-player.component.html',
  styleUrls: ['./viewer-buffer-player.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslocoDirective,
    ReactiveFormsModule,
    MatTooltip,
    TluiToggleModule,
    TluiButtonModule,
    SvgIconComponent,
    DatePipe,
    AsyncPipe,
    TluiSliderModule,
    TluiFormFieldModule,
    ViewerPlayerUserDateComponent,
  ],
  standalone: true,
  providers: ViewerBufferPlayerProviders,
})
export class ViewerBufferPlayerComponent implements OnInit {
  private readonly popupService = inject(PopupService);
  private readonly viewerService = inject(ViewerService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOMService = inject(ViewerOMService);
  private readonly viewerFormulaService = inject(ViewerFormulaService);
  private readonly vBTagService = inject(ViewerBufferTagService);
  private readonly vBOmService = inject(ViewerBufferOmService);
  private readonly vBFormulaService = inject(ViewerBufferFormulaService);
  private readonly mnemoLoggerService = inject(MnemoLoggerService);
  public playerModeService = inject(PlayerModeService);
  public playerService = inject(PlayerService);

  @ViewChild('scrollContainer', { read: ElementRef }) public scrollContainer: ElementRef<HTMLElement>;
  @ViewChild('slider', { read: ElementRef }) public sliderRef: ElementRef;
  public isLoading$: Observable<boolean>;
  public toggle: FormControl = new FormControl(false);
  public timelineControl: FormControl = new FormControl(0);
  public isSliderHover$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public isCursorEvent: boolean = false;

  public ngOnInit(): void {
    this.isLoading$ = this.viewerService.isLoadingViewer$.asObservable();

    this.toggle.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this)).subscribe((t) => {
      if (t) {
        this.playerModeService.playerModeOn();
        this.playerService.setTimeObject(null, null, true);
        this.playerModeService.playPlayer();
        this.getData(true);
      } else {
        this.clearData();
      }
      this.changeDetectorRef.markForCheck();
    });

    this.playerService.currentPositionChanged$
      .pipe(
        filter(() => !this.isSliderHover$.value),
        takeUntilDestroyed(this)
      )
      .subscribe((v) => {
        this.timelineControl.patchValue(v, {
          emitEvent: false,
          onlySelf: true,
        });
      });

    this.timelineControl.valueChanges
      .pipe(
        filter(() => this.isSliderHover$.value),
        debounceTime(300),
        takeUntilDestroyed(this)
      )
      .subscribe((v: number) => {
        this.isCursorEvent = true;
        this.playerService.changeCurrentPositionCursor(v);
      });

    this.viewerService.cleanDiagram$
      .pipe(
        filter((x) => !!x),
        takeUntilDestroyed(this)
      )
      .subscribe(() => this.clearData());

    combineLatest([
      this.viewerTagService.updateTagDataPlayer$,
      this.viewerOMService.updateOmDataPlayer$,
      this.viewerFormulaService.updateFormulaDataPlayer$,
    ])
      .pipe(
        filter(() => this.playerService.playerAcceleration < 4),
        debounceTime(300),
        takeUntilDestroyed(this)
      )
      .subscribe(() => {
        this.getData();
      });

    this.playerService.checkBuffer$.pipe(takeUntilDestroyed(this)).subscribe(() => {
      this.getData();
    });
  }

  public onClickButton(event: PlayerButtonType): void {
    switch (event) {
      case 'reset':
        this.playerService.refreshCurrentPosition();
        break;
      case 'back':
        this.playerService.backCurrentPosition();
        break;
      case 'backPeriod':
        this.playerService.backPeriod();
        break;
      case 'forwardPeriod':
        this.playerService.forwardPeriod();
        break;
      case 'forward':
        this.playerService.forwardCurrentPosition();
        break;
      case 'loop':
        this.playerService.changePlayerLoop();
        break;
      case 'startPause':
        this.playerModeService.playPlayer();
        break;
      case 'acceleration':
        this.playerService.changePlayerAcceleration();
        break;
      default:
        break;
    }
  }

  public setUserDate(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();
    this.playerModeService.stopPlayer();
    this.popupService
      .open(
        ViewerPlayerUserDateComponent,
        {
          dateFrom: this.playerService.dateObj.periodFrom,
          dateTo: this.playerService.dateObj.periodTo,
        },
        {
          origin: this.scrollContainer,
          positions: [{ originX: 'center', originY: 'bottom', overlayX: 'center', overlayY: 'top' }],
        }
      )
      .popupRef.afterClosed()
      .subscribe((res: { dateFrom: Date; dateTo: Date }) => {
        if (res?.dateFrom && res?.dateTo) {
          this.playerService.setTimeObject(res.dateFrom, res.dateTo, true);
          this.playerModeService.playPlayer();
        }
      });
  }

  public sliderMouseEvent(b: boolean): void {
    this.isSliderHover$.next(b);
  }

  private getData(isInit: boolean = false): void {
    if (isInit) {
      this.mnemoLoggerService.catchMessage('info', 'mnemo.ViewerPlayerComponent.loadingStart');
      this.viewerService.isLoadingViewer$.next(true);
      this.getDataTrigger(isInit);
      return;
    }

    if (this.isCursorEvent) {
      this.getDataTrigger(isInit);
      return;
    }

    if (
      this.playerService.isDataDownloaded ||
      this.playerService.getCurrentPositionPercent() < 50 ||
      this.playerService.dateObj.isBufferDownloaded
    ) {
      return;
    }

    this.getDataTrigger(isInit);
  }

  private getDataTrigger(isInit: boolean = false): void {
    this.playerService.addBufferTime();

    this.playerService.isDataDownloaded = true;

    combineLatest([this.vBTagService.getData(), this.vBOmService.getData(), this.vBFormulaService.getData()])
      .pipe(takeUntilDestroyed(this))
      .subscribe({
        next: () => {
          if (isInit) {
            this.mnemoLoggerService.catchMessage('ok', 'mnemo.ViewerPlayerComponent.loadingSuccess');
            this.viewerService.isLoadingViewer$.next(false);
          }
          if (this.isCursorEvent) {
            this.isCursorEvent = false;
          }
          this.playerService.addDownloaded();
          this.playerService.isDataDownloaded = false;
        },
        error: (error) => {
          this.mnemoLoggerService.catchErrorMessage('warning', 'mnemo.ViewerPlayerComponent.loadingError', error);
          this.viewerService.isLoadingViewer$.next(false);

          if (!isInit) {
            this.playerService.deleteBufferTime();
          }
        },
      });
  }

  private clearData(): void {
    this.playerModeService.playerModeOff();
    this.viewerService.isLoadingViewer$.next(false);
  }
}
