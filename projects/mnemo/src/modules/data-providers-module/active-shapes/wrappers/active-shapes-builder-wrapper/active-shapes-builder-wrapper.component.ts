/* eslint-disable import/no-extraneous-dependencies */
import { CdkMenu } from '@angular/cdk/menu';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Injector, Input, OnInit } from '@angular/core';
import { provideTranslocoScope, TranslocoPipe } from '@jsverse/transloco';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { BehaviorSubject } from 'rxjs';
import { MnemoScopeLoader } from '../../../../../assets';
import { DataItemTypeEnum, IDashboardItem, ViewElementTypeEnum } from '../../../../../models';
import { FnPipe } from '../../../../../pipes';
import { ActiveShapesDataCreatorService } from '../../services';
import { ActiveShapesWrapperAbstract } from '../active-shapes-wrapper.abstract';
import { ActiveShapesWrapperDirective } from '../active-shapes-wrapper.directive';

@Component({
  selector: 'tl-mnemo-active-shapes-builder-wrapper',
  standalone: true,
  imports: [AsyncPipe, CdkMenu, FnPipe, NgComponentOutlet, NgxSkeletonLoaderModule, TranslocoPipe],
  templateUrl: './active-shapes-builder-wrapper.component.html',
  styleUrl: './active-shapes-builder-wrapper.component.scss',
  providers: [
    ActiveShapesDataCreatorService,
    provideTranslocoScope({
      scope: 'mnemo',
      loader: MnemoScopeLoader,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveShapesBuilderWrapperComponent
  extends ActiveShapesWrapperDirective
  implements OnInit, ActiveShapesWrapperAbstract
{
  public override injector = inject(Injector);
  private readonly activeShapesDataCreatorService = inject(ActiveShapesDataCreatorService);

  @Input() public item: IDashboardItem | null = null;

  @Input()
  public size: { width: number; height: number } = { width: 400, height: 200 };

  @Input() public viewType: ViewElementTypeEnum;
  @Input() public dataType: DataItemTypeEnum;

  @Input() public exampleView: boolean = false;

  @Input() public isVisible$: BehaviorSubject<boolean> = new BehaviorSubject(true);

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.item = this.activeShapesDataCreatorService.createDashboardObject(this.viewType, this.dataType);
  }
}
