/* eslint-disable import/no-extraneous-dependencies */
import {
  Dependency,
  DependentOn,
  IConfigService,
  Inject,
  Injector,
  LocaleService,
  mergeOverrideWithDependencies,
  Plugin,
  touchDependencies,
} from '@univerjs/core';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverTableTlController } from './controllers/univer-table-tl-controller';
import { enUS, faIR, ruRU } from './locale';
import { TL_PLUGIN_CONFIG_KEY, UNIVER_TABLE_TL_PLUGIN } from './models/const';
import { TlPluginType } from './models/plugin.type';

@DependentOn(UniverRenderEnginePlugin)
// eslint-disable-next-line @typescript-eslint/naming-convention
export class UniverTableTLPlugin extends Plugin {
  public static override pluginName = UNIVER_TABLE_TL_PLUGIN;

  constructor(
    // eslint-disable-next-line @typescript-eslint/default-param-last
    private readonly _config: Partial<{ type: TlPluginType }> = { type: 'builder' },
    @Inject(Injector) protected readonly _injector: Injector,
    @IConfigService private readonly _configService: IConfigService,
    @Inject(LocaleService) private readonly _localeService: LocaleService
  ) {
    super();
    const { ...rest } = this._config;
    this._configService.setConfig(TL_PLUGIN_CONFIG_KEY, rest);
    this._localeService.load({ ruRU, enUS, faIR });
    this._initDependencies();
  }

  public override onRendered(): void {
    touchDependencies(this._injector, [[UniverTableTlController]]);
  }

  private _initDependencies(): void {
    mergeOverrideWithDependencies([[UniverTableTlController]]).forEach((d: Dependency) => this._injector.add(d));
  }
}
