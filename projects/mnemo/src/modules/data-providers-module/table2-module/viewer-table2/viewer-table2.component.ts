/* eslint-disable import/no-extraneous-dependencies */
import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { DecorateUntilDestroy, takeUntilDestroyed, ThemeConfiguratorService } from '@tl-platform/core';
import { IDisposable, Injector, IWorkbookData, Univer } from '@univerjs/core';
import { StyleService } from '../../../../services';
import { MnemoPopupChartService } from '../../../additional-modules/mnemo-chart-module/services';
import { ViewerService, ViewerTagService } from '../../../pure-modules';
import {
  IUniverTableTlCommandService,
  tableThemeLight,
  univerLocales,
  UtTlCellDataService,
  UtTlInjectorService,
  UtTlLocaleService,
  UtTlPluginService,
  utTlSharedProviders,
  UtTlThemeService,
} from '../components/univer-table-tl';
import {
  UtvDataRefService,
  UtvManualTagValueService,
  UtvService,
  UtvTooltipService,
  UtvValueService,
} from './services';
import { utTlProviders } from './ut-table-providers';

@DecorateUntilDestroy()
@Component({
  selector: 'tl-mnemo-viewer-table2',
  templateUrl: './viewer-table2.component.html',
  styleUrl: './viewer-table2.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  providers: [StyleService, ...utTlProviders, ...utTlSharedProviders],
  imports: [ReactiveFormsModule, AsyncPipe],
})
export class ViewerTable2Component implements OnInit, OnDestroy {
  private readonly utvService = inject(UtvService);
  private readonly utvDataRefService = inject(UtvDataRefService);
  private readonly uttlPluginService = inject<UtTlPluginService<UtvDataRefService>>(UtTlPluginService);
  private readonly uttlLocaleService = inject<UtTlLocaleService<UtvService, UtvDataRefService>>(UtTlLocaleService);
  private readonly utvValueService = inject(UtvValueService);
  private readonly uttlCellDataService = inject(UtTlCellDataService);
  private readonly uttlInjectorService = inject(UtTlInjectorService);
  private readonly utThemeService = inject<UtTlThemeService<UtvDataRefService>>(UtTlThemeService);
  private readonly utvManualTagValueService = inject(UtvManualTagValueService);
  private readonly mnemoPopupChartService = inject(MnemoPopupChartService);
  private readonly viewerService = inject(ViewerService);
  public utvTooltipService = inject(UtvTooltipService);
  public themeService = inject(ThemeConfiguratorService);
  public viewerTagService = inject(ViewerTagService);

  @ViewChild('containerRef', { static: true }) public containerRef: ElementRef | null = null;
  private injector: Injector;
  private beforeCommandExecuter: IDisposable | null = null;
  private commandExecuter: IDisposable | null = null;
  private isDarkTheme: boolean | null = null;
  private isMenuCleaned: boolean | null = false;

  @Input()
  public set data(v: IWorkbookData) {
    this.utvDataRefService.data = v;
  }

  public ngOnInit(): void {
    this.themeService.isDarkTheme.pipe(takeUntilDestroyed(this)).subscribe((isDarkTheme: boolean) => {
      this.isDarkTheme = isDarkTheme;
      this.setTheme();
    });
    this.init();
  }

  public ngOnDestroy(): void {
    this.utvService.destroy();
    this.utvTooltipService.destroySubs();
    this.utvValueService.destroySubs();
    this.commandExecuter?.dispose();
    this.beforeCommandExecuter?.dispose();
    this.utvDataRefService.destroyUniver();
    this.injector?.dispose();
  }

  public clearContextMenu(): void {
    if (this.isMenuCleaned) return;
    const elementList = document.querySelectorAll('.univer-menu-item-group');
    if (elementList?.length > 1) {
      elementList[0].remove();
      this.clearContextMenu();
    } else {
      this.isMenuCleaned = true;
    }
  }

  private init(): void {
    if (!this.containerRef) {
      throw new Error('Container reference is not initialized');
    }

    this.uttlLocaleService.init(this.utvService, this.utvDataRefService);

    this.utvDataRefService.univer = new Univer({
      theme: tableThemeLight,
      locale: this.uttlLocaleService.getActiveLocale(),
      locales: univerLocales,
    });

    this.injector = this.utvDataRefService.univer.__getInjector();
    this.uttlInjectorService.init(this.injector);

    this.uttlPluginService.init(this.utvDataRefService, this.containerRef, true);
    this.utvDataRefService.init();
    this.utThemeService.init(this.utvDataRefService);
    this.utvValueService.getCellName();

    this.uttlCellDataService.init(this.utvDataRefService);

    this.utvTooltipService.initSubs();
    this.initListener();

    setTimeout(() => this.setTheme());
  }

  private initListener(): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    this.commandExecuter = this.utvDataRefService.univerAPI.onCommandExecuted((command) => {
      //   console.log('command', command);
    });
    this.beforeCommandExecuter = this.utvDataRefService.univerAPI.onBeforeCommandExecute((command) => {
      // Отмена редактирования
      if (
        command.id === 'sheet.command.auto-fill' ||
        command.id === 'sheet.command.insert-sheet' ||
        command.id === 'sheet.operation.set-activate-cell-edit'
      ) {
        throw Error('Editing not allowed');
      }
    });

    const instance = this.uttlInjectorService.getInstanceByInjector(IUniverTableTlCommandService);
    instance.showChart$.pipe(takeUntilDestroyed(this)).subscribe((cell) => {
      if (!cell) return;
      this.mnemoPopupChartService.tooltipChartData$.next(cell);
      this.viewerService.hiddenChartOpt = false;
    });
    instance.setManualTag$.pipe(takeUntilDestroyed(this)).subscribe((cell) => {
      if (!cell && !cell.custom.isManualTag) return;
      this.utvManualTagValueService.openManualTag(cell);
    });
  }

  private setTheme(): void {
    if (this.isDarkTheme) {
      this.utThemeService.setDark();
    } else {
      this.utThemeService.setLight();
    }
  }
}
