/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';

@Injectable()
export class StyleService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public parseStyle(styleString: string): Record<string, any> {
    const object = {};
    if (!styleString) return object;
    styleString.split(';').forEach((style) => {
      const items = style.split('=');
      if (items.length > 1) {
        // eslint-disable-next-line prefer-destructuring
        object[items[0]] = items[1];
      }
    });
    return object;
  }

  public parseStyleArray(styleStringDivider: string, divider: string = '~'): Record<string, string>[] {
    const newArray = [];
    const array = styleStringDivider.split(divider);
    if (!styleStringDivider) return newArray;
    array.forEach((arrayString) => {
      const object = {};
      arrayString.split(';').forEach((style) => {
        const items = style.split('=');
        if (items.length > 1) {
          // eslint-disable-next-line prefer-destructuring
          object[items[0]] = items[1];
        }
      });
      newArray.push(object);
    });
    return newArray;
  }

  public replaceStyle(styleString: string, styleObject: Object): Record<string, unknown> {
    const prevObject = this.parseStyle(styleString);
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(styleObject)) {
      prevObject[key] = value;
    }
    return prevObject;
  }

  public combineStyle(styleObject: Object): string {
    let result = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(styleObject)) {
      result = `${result + key}=${value};`;
    }
    return result;
  }

  public combineStyleWithoutNull(styleObject: Object): string {
    let result = '';
    // eslint-disable-next-line no-restricted-syntax
    for (const [key, value] of Object.entries(styleObject)) {
      if (styleObject[key] !== null && styleObject[key] !== undefined) {
        result = `${result + key}=${value};`;
      }
    }
    return result;
  }
}
