import {
  UtvDataRefService,
  UtvFormulaValueService,
  UtvManualTagValueService,
  UtvOmValueService,
  UtvRuleService,
  UtvService,
  UtvTagValueService,
  UtvTooltipService,
  UtvValueApplyService,
  UtvValueService,
} from './services';

export const utTlProviders = [
  UtvService,
  UtvDataRefService,
  UtvValueService,
  UtvTagValueService,
  UtvOmValueService,
  UtvFormulaValueService,
  UtvValueApplyService,
  UtvRuleService,
  UtvTooltipService,
  UtvManualTagValueService,
];
