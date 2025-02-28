/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { BorderStyleTypes, IBorderData, IStyleData } from '@univerjs/core';
import { ColorType, CompareType, DEFAULT_STYLES_HEX, IRuleValue, PaintTargetType } from '../../../../../consts';
import { StatusType } from '../../../../../models';
import { StyleService } from '../../../../../services';

type PaintTargetResTableType = 'cl' | 'bg' | 'bd';

export interface IStyleAndValueTable2 {
  style: IStyleData;
  value: number | null;
  invisible: boolean;
  blink: boolean;
}

@Injectable()
export class UtvRuleService {
  private readonly styleService = inject(StyleService);

  public addDefaultValueTable(
    styleObj: IStyleData,
    rules: string
  ): { tagRules: string; tagDefStyle: Record<string, string> } | null {
    let tagDefStyle: Record<string, string> | null = null;
    let isExistDefault: boolean = false;
    const tagRules = rules
      .split('~')
      .map((rule) => {
        const rulesObj = this.styleService.parseStyle(rule);
        if (
          rulesObj.ActionRule === 'Blink' ||
          rulesObj.ActionRule === 'Invisible' ||
          rulesObj.ActionRule === 'ReplaceLabel'
        ) {
          return rule;
        }

        if (rulesObj.PaintTarget === 'Shape') {
          rulesObj.PaintTarget = 'StrokeColor';
        }

        if (rulesObj[`Default${rulesObj.PaintTarget}`]) {
          isExistDefault = true;
          tagDefStyle = null;
          return rule;
        }
        const defaultKey: PaintTargetResTableType = this.getPaintTargetTable(rulesObj.PaintTarget);

        if (defaultKey) {
          const objFromStyle = styleObj?.[defaultKey];
          const objDef = { defaultKey: {} };

          const defaultColorObj = styleObj?.[defaultKey] ? objFromStyle : objDef;
          const defaultColor = JSON.stringify(defaultColorObj);
          rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
          rulesObj.DefaultColor = defaultColor;

          if (!styleObj?.[defaultKey]) {
            // @ts-ignore
            tagDefStyle = { ...tagDefStyle, [defaultKey]: objDef };
          } else {
            // @ts-ignore
            tagDefStyle = { ...tagDefStyle, [defaultKey]: objFromStyle };
          }
        }
        rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
        return this.styleService.combineStyle(rulesObj);
      })
      .join('~');

    return isExistDefault ? null : { tagRules, tagDefStyle };
  }

  public getStyleAndValueTable(
    styleObj: IStyleData,
    value: number,
    rules: string,
    status: StatusType,
    defaultStyle: object | null
  ): IStyleAndValueTable2 {
    const newRules: { [changeKey: string]: string }[] = [];
    let invisible: boolean = false;
    let blink: boolean = false;
    let newValue: number = null;

    rules.split('~').forEach((rule) => {
      const rulesObj = this.styleService.parseStyle(rule);
      const rulesValue: IRuleValue = rulesObj.CompareValue
        ? { CompareValueFrom: rulesObj.CompareValue, CompareValueTo: rulesObj.CompareValue }
        : { CompareValueFrom: rulesObj.CompareValueFrom, CompareValueTo: rulesObj.CompareValueTo };
      const resultCompare: boolean = this.checkValue(Number(value), rulesValue, rulesObj.CompareRule, status);

      if (rulesObj.PaintTarget === 'Shape') {
        rulesObj.PaintTarget = 'StrokeColor';
      }

      if (rulesObj.PaintTarget !== 'Shape') {
        const name = this.getPaintTargetTable(rulesObj.PaintTarget);
        if (styleObj) {
          styleObj[name] = defaultStyle[name];
        } else {
          styleObj = { [name]: defaultStyle[name] };
        }
      }

      switch (rulesObj.ActionRule) {
        case 'Paint':
          newRules.push(this.replacePaintOptionsTable(rulesObj, resultCompare, defaultStyle));
          break;
        case 'Invisible':
          invisible = resultCompare;
          break;
        case 'Blink':
          blink = resultCompare;
          break;
        case 'ReplaceLabel':
          newValue = resultCompare ? rulesObj.ReplaceValue : null;
          break;
        default:
          break;
      }
    });

    newRules.forEach((r) => {
      if (r.resultCompare === 'true') {
        styleObj[r.name] = r[r.name];
      }
    });

    return {
      style: styleObj,
      value: newValue ?? value,
      invisible,
      blink,
    };
  }

  private getPaintTargetTable(key: PaintTargetType): PaintTargetResTableType {
    switch (key) {
      case 'FillColor':
        return 'bg';
      case 'Shape':
      case 'StrokeColor':
        return 'bd';
      case 'Label':
        return 'cl';
      default:
        return null;
    }
  }

  private checkValue(value: number, ruleValue: IRuleValue, rule: CompareType, status?: string): boolean {
    switch (rule) {
      case 'Equal':
        return value === ruleValue.CompareValueFrom;
      case 'Greater':
        return value >= ruleValue.CompareValueFrom;
      case 'Less':
        return value <= ruleValue.CompareValueFrom;
      case 'Between':
        return value >= ruleValue.CompareValueFrom && value <= ruleValue.CompareValueTo;
      case 'Out':
        return !(value >= ruleValue.CompareValueFrom && value <= ruleValue.CompareValueTo);
      case 'Bad':
        return status === 'Bad';
      default:
        return false;
    }
  }

  private replacePaintOptionsTable(
    rulesObj: Record<string, string>,
    resultCompare: boolean,
    defaultStyle: object
  ): { [changeKey: string]: string } {
    const name = this.getPaintTargetTable(<'FillColor' | 'StrokeColor' | 'Label' | 'Shape'>rulesObj.PaintTarget);

    switch (rulesObj.PaintTarget) {
      case 'Shape':
      case 'Label':
      case 'StrokeColor':
      case 'FillColor':
      default: {
        let resultColor: { [changeKey: string]: { rgb: string } | IBorderData };
        if (resultCompare) {
          resultColor = this.changeColorTable(
            <'Default' | 'Success' | 'Info' | 'Warning' | 'Error'>rulesObj.ColorValue,
            <'FillColor' | 'StrokeColor' | 'Label' | 'Shape'>rulesObj.PaintTarget
          );
        } else {
          resultColor = { [name]: { rgb: defaultStyle[name] } };
        }
        return { ...resultColor, resultCompare: resultCompare ? 'true' : '', name };
      }
    }
  }

  private changeColorTable(
    color: ColorType,
    key: PaintTargetType
  ): {
    [changeKey: string]: { rgb: string } | IBorderData;
  } {
    const changeKey: PaintTargetResTableType = this.getPaintTargetTable(key);
    if (changeKey === 'bd') {
      switch (color) {
        case 'Default':
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              r: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              b: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              l: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
            },
          };
        case 'Success':
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.successColor } },
              r: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.successColor } },
              b: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.successColor } },
              l: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.successColor } },
            },
          };
        case 'Info':
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.infoColor } },
              r: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.infoColor } },
              b: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.infoColor } },
              l: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.infoColor } },
            },
          };
        case 'Warning':
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.warningColor } },
              r: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.warningColor } },
              b: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.warningColor } },
              l: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.warningColor } },
            },
          };
        case 'Error':
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.errorColor } },
              r: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.errorColor } },
              b: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.errorColor } },
              l: { s: BorderStyleTypes.MEDIUM, cl: { rgb: DEFAULT_STYLES_HEX.errorColor } },
            },
          };
        default:
          return {
            [changeKey]: {
              t: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              r: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              b: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
              l: { s: BorderStyleTypes.NONE, cl: { rgb: DEFAULT_STYLES_HEX.defaultColor } },
            },
          };
      }
    } else {
      switch (color) {
        case 'Default':
          return { [changeKey]: { rgb: DEFAULT_STYLES_HEX.defaultColor } };
        case 'Success':
          return { [changeKey]: { rgb: DEFAULT_STYLES_HEX.successColor } };
        case 'Info':
          return { [changeKey]: { rgb: DEFAULT_STYLES_HEX.infoColor } };
        case 'Warning':
          return { [changeKey]: { rgb: DEFAULT_STYLES_HEX.warningColor } };
        case 'Error':
          return { [changeKey]: { rgb: DEFAULT_STYLES_HEX.errorColor } };
        default:
          // @ts-ignore
          return { [changeKey]: color };
      }
    }
  }
}
