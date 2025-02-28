import {
  UtTlCellDataService,
  UtTlCommandService,
  UtTlDataRefService,
  UtTlInjectorService,
  UtTlLocaleService,
  UtTlPluginService,
  UtTlThemeService,
} from './services';

export const utTlSharedProviders = [
  UtTlCommandService,
  UtTlDataRefService,
  UtTlLocaleService,
  UtTlPluginService,
  UtTlCellDataService,
  UtTlInjectorService,
  UtTlThemeService,
];
