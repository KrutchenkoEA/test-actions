/* eslint-disable import/no-extraneous-dependencies */
import { Disposable, ICommandService, IConfigService, Inject, Injector } from '@univerjs/core';
import { IMenuManagerService } from '@univerjs/ui';
import { TlAddManualTagCommand } from '../commands/commands/add-manual-tag.command';
import { TlSetManualTagCommand } from '../commands/commands/set-manual-tag.command';
import { TlEditDataCommand } from '../commands/commands/tl-edit-data.command';
import { TlShowChartOperation } from '../commands/operations/show-chart.operation';
import {
  TlDropdownListFirstItemOperation,
  TlDropdownListSecondItemOperation,
} from '../commands/operations/tl-dropdown-list.operation';
import { TL_PLUGIN_CONFIG_KEY } from '../models/const';
import { TlPluginType } from '../models/plugin.type';
import { builderMenuSchema } from './schemas/builder-menu.schema';
import { viewerMenuSchema } from './schemas/viewer-menu.schema';

// eslint-disable-next-line @typescript-eslint/naming-convention
export class UniverTableTlController extends Disposable {
  public type: TlPluginType = 'builder';

  constructor(
    // eslint-disable-next-line @typescript-eslint/parameter-properties
    @Inject(Injector) public readonly _injector: Injector,
    @ICommandService private readonly _commandService: ICommandService,
    @IMenuManagerService private readonly _menuManagerService: IMenuManagerService,
    @IConfigService private readonly _configService: IConfigService
  ) {
    super();
    // @ts-ignore
    this.type = this._configService.getConfig<{ type: TlPluginType }>(TL_PLUGIN_CONFIG_KEY)?.type ?? 'builder';
    this._initCommands();
    this._initMenus();
  }

  /**
   * register commands
   */
  private _initCommands(): void {
    const commands =
      this.type === 'viewer'
        ? [TlShowChartOperation, TlSetManualTagCommand]
        : [
            TlEditDataCommand,
            TlAddManualTagCommand,
            TlDropdownListFirstItemOperation,
            TlDropdownListSecondItemOperation,
          ];

    commands.forEach((c) => {
      this.disposeWithMe(this._commandService.registerCommand(c));
    });
  }

  /**
   * register menu items
   */
  private _initMenus(): void {
    this._menuManagerService.mergeMenu(this.type === 'viewer' ? viewerMenuSchema : builderMenuSchema);
  }
}
