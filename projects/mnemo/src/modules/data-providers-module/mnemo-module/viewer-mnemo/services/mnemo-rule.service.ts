/* eslint-disable import/no-extraneous-dependencies */
import { inject, Injectable } from '@angular/core';
import { DecorateUntilDestroy } from '@tl-platform/core';
import { ColorEnum, ColorType, CompareType, DEFAULT_STYLES, IRuleValue, PaintTargetType } from '../../../../../consts';
import { StatusType } from '../../../../../models';
import { StyleService } from '../../../../../services';

// type ActionType = 'Paint' | 'ReplaceLabel' | 'Blink' | 'Invisible';
type TemplateType = 'default' | 'success' | 'info' | 'warning' | 'error' | 'dark' | 'light';
type PaintTargetResType =
  | 'fillColor'
  | 'strokeColor'
  | 'fontColor'
  | 'light'
  | 'dark'
  | 'info'
  | 'default'
  | 'warning'
  | 'error'
  | 'success';

export interface IStyleAndValue {
  style: string;
  value: number | null;
  invisible: boolean;
  blink: boolean;
}

@DecorateUntilDestroy()
@Injectable()
export class MnemoRuleService {
  private readonly styleService = inject(StyleService);

  public getValueActiveElementMnemo(cell, val: number): { gradient: SVGLinearGradientElement; id: string } {
    const rulesObj = this.styleService.parseStyle(cell.tagRules);
    const id = `gradientcell${cell.id}`;
    const maxValue: number = Number(rulesObj.maxValue) ?? 10;
    const minValue: number = Number(rulesObj.minValue) ?? 1;
    const exp = (val - minValue) / (maxValue - minValue);
    const currentPercent = Number.isNaN(exp) ? 0 : exp;
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', id);
    gradient.setAttribute('x1', '0');
    gradient.setAttribute('x2', '0');
    gradient.setAttribute('y1', '0');
    gradient.setAttribute('y2', `1`);

    if (minValue > maxValue) {
      gradient.innerHTML = `<stop offset="0%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColorEmpty}"></stop>`;
    } else if (currentPercent >= 1) {
      gradient.innerHTML = `<stop offset="100%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColor}"></stop>`;
    } else if (currentPercent <= 0) {
      gradient.innerHTML = `<stop offset="0%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColorEmpty}"></stop>`;
    } else {
      gradient.innerHTML =
        `<stop offset="0%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColorEmpty}"></stop>` +
        `<stop offset="${(1 - currentPercent) * 100}%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColorEmpty}"></stop>` +
        `<stop offset="${(1 - currentPercent) * 100}%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColor}"></stop>` +
        `<stop offset="100%" stop-opacity="1" stop-color="${DEFAULT_STYLES.activeBarColor}"></stop>`;
    }

    return { gradient, id };
  }

  public fillActiveElementMnemo(id): string {
    const newStyle = {
      shape: 'rounded',
      rounded: 1,
      arcSize: 10,
      fillColor: `url(#${id})`,
      strokeColor: 'var(--color-predictors-11)',
      strokeWidth: 3,
    };

    return this.styleService.combineStyle(newStyle);
  }

  public addDefaultValueMnemo(
    styleString: string,
    rules: string,
    type: string
  ): {
    tagRules: string;
    tagDefStyle: Record<string, string>;
  } | null {
    const styleObj = this.styleService.parseStyle(styleString);
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

        if (rulesObj.ActionRule === 'Paint') {
          if (
            type === 'svg-shape' &&
            (rulesObj.PaintTarget === 'StrokeColor' || rulesObj.PaintTarget === 'FillColor')
          ) {
            rulesObj.PaintTarget = 'Shape';
          }
          if (type === 'geometry-shape' && rulesObj.PaintTarget === 'Shape') {
            rulesObj.PaintTarget = 'StrokeColor';
          }
        }

        if (rulesObj[`Default${rulesObj.PaintTarget}`]) {
          isExistDefault = true;
          tagDefStyle = null;
          return rule;
        }
        const defaultKey: PaintTargetResType = this.getPaintTargetMnemo(rulesObj.PaintTarget, styleObj);

        if (rulesObj.PaintTarget === 'Shape') {
          tagDefStyle = { ...tagDefStyle, image: styleObj.image };
        } else {
          tagDefStyle = {
            ...tagDefStyle,
            [defaultKey]: styleObj[defaultKey] ? styleObj[defaultKey] : DEFAULT_STYLES.fontColor,
          };
        }

        rulesObj[`Default${rulesObj.PaintTarget}`] = defaultKey;
        return this.styleService.combineStyle(rulesObj);
      })
      .join('~');

    return isExistDefault ? null : { tagRules, tagDefStyle };
  }

  public getStyleAndValueMnemo(
    styleString: string,
    value: number,
    rules: string,
    status: StatusType,
    type: string,
    defaultStyle: Record<string, string>
  ): IStyleAndValue {
    if (!rules) {
      return null;
    }
    const styleObj = this.styleService.parseStyle(styleString);
    const newRules: { [changeKey: string]: string }[] = [];
    let invisible: boolean = false;
    let blink: boolean = false;
    let newValue: number = null;

    rules.split('~').forEach((rule) => {
      const rulesObj = this.styleService.parseStyle(rule);
      const rulesValue: IRuleValue = rulesObj.CompareValue
        ? { CompareValueFrom: Number(rulesObj.CompareValue), CompareValueTo: Number(rulesObj.CompareValue) }
        : { CompareValueFrom: Number(rulesObj.CompareValueFrom), CompareValueTo: Number(rulesObj.CompareValueTo) };
      const resultCompare: boolean = this.checkValue(value, rulesValue, rulesObj.CompareRule, status);

      switch (rulesObj.ActionRule) {
        case 'Paint': {
          const name = this.getPaintTargetMnemo(rulesObj.PaintTarget, styleObj);

          if (
            type === 'svg-shape' &&
            (rulesObj.PaintTarget === 'StrokeColor' || rulesObj.PaintTarget === 'FillColor')
          ) {
            rulesObj.PaintTarget = 'Shape';
          }
          if (type === 'geometry-shape' && rulesObj.PaintTarget === 'Shape') {
            rulesObj.PaintTarget = 'StrokeColor';
          }
          if (rulesObj.PaintTarget === 'Shape') {
            styleObj.image = defaultStyle.image;
          } else {
            styleObj[name] = defaultStyle[name];
          }

          newRules.push(this.replacePaintOptionsMnemo(rulesObj, resultCompare, styleObj, defaultStyle));
          break;
        }
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
      style: this.styleService.combineStyleWithoutNull(styleObj),
      value: newValue ?? value,
      invisible,
      blink,
    };
  }

  private checkValue(value: number, ruleValue: IRuleValue, rule: CompareType, status?: StatusType): boolean {
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

  private replacePaintOptionsMnemo(
    rulesObj: Record<string, string>,
    resultCompare: boolean,
    styleObj: Record<string, string>,
    defaultStyle: Record<string, string>
  ): Record<string, string> {
    const name = this.getPaintTargetMnemo(rulesObj.PaintTarget as PaintTargetType, styleObj);

    switch (rulesObj.PaintTarget) {
      case 'Label':
      case 'StrokeColor':
      case 'FillColor': {
        let resultColor: { [changeKey: string]: string };
        if (resultCompare) {
          resultColor = this.changeColorMnemo(rulesObj.ColorValue as ColorType, rulesObj.PaintTarget);
        } else {
          resultColor = { [name]: defaultStyle[name] };
        }
        return { ...resultColor, resultCompare: resultCompare ? 'true' : '', name };
      }
      case 'Shape': {
        let replacedSvg: { image: string };
        if (resultCompare) {
          replacedSvg = this.replaceSvgTemplateMnemo(styleObj.image, rulesObj.ColorValue as ColorType);
        } else {
          replacedSvg = this.replaceSvgTemplateMnemo(styleObj.image, rulesObj.DefaultShape as ColorType);
        }
        return { ...replacedSvg, resultCompare: resultCompare ? 'true' : '', name: 'image' };
      }
      default:
        return null;
    }
  }

  private replaceSvgTemplateMnemo(path: string, colorRules: ColorType): { image: string } {
    let newTemplate: TemplateType = 'dark';
    switch (colorRules.toLowerCase()) {
      case 'default':
        newTemplate = `${ColorEnum.Default}`;
        break;
      case 'success':
        newTemplate = `${ColorEnum.Success}`;
        break;
      case 'info':
        newTemplate = `${ColorEnum.Info}`;
        break;
      case 'warning':
        newTemplate = `${ColorEnum.Warning}`;
        break;
      case 'error':
        newTemplate = `${ColorEnum.Error}`;
        break;
      default:
        newTemplate = 'light';
        break;
    }
    return { image: path.replace(/light|dark|info|default|warning|error|success/, newTemplate) };
  }

  private changeColorMnemo(color: ColorType, key: PaintTargetType): { [changeKey: string]: string } {
    const changeKey: PaintTargetResType = this.getPaintTargetMnemo(key);
    switch (color) {
      case 'Default':
        return { [changeKey]: DEFAULT_STYLES.defaultColor };
      case 'Success':
        return { [changeKey]: DEFAULT_STYLES.successColor };
      case 'Info':
        return { [changeKey]: DEFAULT_STYLES.infoColor };
      case 'Warning':
        return { [changeKey]: DEFAULT_STYLES.warningColor };
      case 'Error':
        return { [changeKey]: DEFAULT_STYLES.errorColor };
      default:
        return { [changeKey]: DEFAULT_STYLES.fontColor };
    }
  }

  private getPaintTargetMnemo(key: PaintTargetType, styleObj?: Record<string, unknown>): PaintTargetResType {
    switch (key) {
      case 'FillColor':
        return 'fillColor';
      case 'StrokeColor':
        return 'strokeColor';
      case 'Label':
        return 'fontColor';
      case 'Shape':
        return (styleObj.image as string)?.match(
          /light|dark|info|default|warning|error|success/
        )?.[0] as PaintTargetResType;
      default:
        return null;
    }
  }
}
