/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe, DatePipe, NgClass, NgForOf } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { DecorateUntilDestroy, takeUntilDestroyed } from '@tl-platform/core';
import { ITableSortEvent, TluiTableModule } from '@tl-platform/ui';
import { BehaviorSubject, filter } from 'rxjs';
import { IMnemoEvent } from '../../../models';
import { ViewerCoreModule, ViewerOMService, ViewerTagService } from '../../pure-modules';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-event-legend',
  templateUrl: './viewer-event-legend.component.html',
  styleUrls: ['./viewer-event-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslocoDirective, TluiTableModule, DatePipe, NgClass, NgForOf, AsyncPipe, ViewerCoreModule],
})
export class ViewerEventLegendComponent implements OnInit {
  private readonly viewerTagService = inject(ViewerTagService);
  private readonly viewerOmService = inject(ViewerOMService);

  public dataSource$: BehaviorSubject<IMnemoEvent[]> = new BehaviorSubject([]);
  public displayedColumns: string[] = ['timeStamp', 'name', 'value', 'status', 'sourceType'];

  public ngOnInit(): void {
    this.viewerTagService.tagEventsHistory$
      .pipe(
        filter((x) => !!x),
        takeUntilDestroyed(this),
      )
      .subscribe((tag) => this.dataSource$.next([tag, ...this.dataSource$.value]));

    this.viewerOmService.omEventsHistory$
      .pipe(
        filter((x) => !!x),
        takeUntilDestroyed(this),
      )
      .subscribe((attr) => this.dataSource$.next([attr, ...this.dataSource$.value]));
  }

  public sort($event: ITableSortEvent): void {
    this.dataSource$.next(
      this.dataSource$.value.sort((a, b) => {
        const order = $event.sortingOrder === 'asc' ? 1 : -1;
        // @ts-ignore
        return a[$event.key] > b[$event.key] ? 1 * order : -1 * order;
      }),
    );
  }
}
