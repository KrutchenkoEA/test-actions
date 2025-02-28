/* eslint-disable import/no-extraneous-dependencies */
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgClass, NgForOf, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  DecorateUntilDestroy,
  STORE_GLOBAL,
  StoreService,
  takeUntilDestroyed,
  TluiDirectionModule,
} from '@tl-platform/core';
import { TluiFormFieldModule } from '@tl-platform/ui';
import { AngularSvgIconModule } from 'angular-svg-icon';
import {
  IActiveShapeTableOptions,
  IDashboardTableChartData,
  IDataMappingOptionsViewer,
} from '../../../../../../models';
import { ACTIVE_SHAPES_BASE_URL } from '../../../active-shapes.tokens';

function compare(a: string, b: string, isAsc: boolean): number {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-active-shape-table-item',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    TluiDirectionModule,
    TluiFormFieldModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    DragDropModule,
    AngularSvgIconModule,
    NgTemplateOutlet,
    NgClass,
  ],
  templateUrl: './table-item.component.html',
  styleUrl: './table-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapeTableItemComponent implements OnInit, OnChanges {
  private readonly store = inject<StoreService>(STORE_GLOBAL);

  @Input() public data: IDataMappingOptionsViewer;
  @Input() public viewOptions: IActiveShapeTableOptions;

  @ViewChild(MatSort) public sort: MatSort;
  @ViewChild(MatTable) public table: MatTable<{ [key: string]: string }[]>;
  @ViewChild(MatPaginator) public paginator: MatPaginator;

  public baseUrl: string = '';
  public dataSource: MatTableDataSource<{ [key: string]: string }> = new MatTableDataSource([]);

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes.data.currentValue) {
      if (this.viewOptions?.table?.isSortEnable) {
        this.dataSource.sort = this.sort;
      }
      if (this.viewOptions?.table?.isPaginatorEnable) {
        this.dataSource.paginator = this.paginator;
      }

      this.dataSource.data = (this.data?.tableData as IDashboardTableChartData).data;
    }
  }

  public ngOnInit(): void {
    this.store
      .getState$<string>(ACTIVE_SHAPES_BASE_URL)
      .pipe(takeUntilDestroyed(this))
      .subscribe((baseUrl) => {
        this.baseUrl = baseUrl;
      });
  }

  public drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.data?.tableData?.displayedColumns, event.previousIndex, event.currentIndex);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/explicit-function-return-type
  public sortData(sort: Sort, dataSource: MatTableDataSource<{ [key: string]: string }>) {
    const data = this.dataSource.data.slice();
    if (!sort.active || sort.direction === '') {
      this.dataSource.data = data;
      return;
    }
    this.dataSource.data = data.sort((a, b) => {
      return compare(a[sort.active], b[sort.active], sort.direction === 'asc');
    });
  }

  public filterTable(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  public getLastRow(dataSource: MatTableDataSource<{ [key: string]: string }>): { [key: string]: string } {
    return dataSource.data.find((d) => !!d.lastRow);
  }

  public getHeaderTitle(key: string): string {
    return this.viewOptions?.keyName?.[key] ? this.viewOptions.keyName[key] : key;
  }
}
