/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';

@Injectable()
export class TableService {
  public alphabets: string[] = [
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
  ];

  // (1, 9) => B10    translate XY-tag to A1-tag
  public xy2expr(x, y): string {
    return `${this.stringAt(x)}${y + 1}`;
  }

  // B10 => x,y (1, 9)   translate A1-tag to XY-tag
  public expr2xy(src): [number, number] {
    let x = '';
    let y = '';
    for (let i = 0; i < src.length; i += 1) {
      if (src.charAt(i) >= '0' && src.charAt(i) <= '9') {
        y += src.charAt(i);
      } else {
        x += src.charAt(i);
      }
    }
    return [this.indexAt(x), parseInt(y, 10) - 1];
  }

  // translate letter in A1-tag to number
  public indexAt(str: string): number {
    let ret = 0;
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i !== str.length; ++i) ret = 26 * ret + str.charCodeAt(i) - 64;
    return ret - 1;
  }

  // stringAt(26) ==> 'AA'   index number 2 letters
  public stringAt(index: number): string {
    let str = '';
    let cindex = index;
    while (cindex >= this.alphabets.length) {
      cindex /= this.alphabets.length;
      cindex -= 1;
      str += this.alphabets[parseInt(cindex.toString(), 10) % this.alphabets.length];
    }
    const last = index % this.alphabets.length;
    str += this.alphabets[last];
    return str;
  }

  // translate A1-tag src by (xn, yn)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public expr2expr(src, xn, yn, condition = (x: number, y: number): boolean => true): string {
    if (xn === 0 && yn === 0) return src;
    const [x, y] = this.expr2xy(src);
    if (!condition(x, y)) return src;
    return this.xy2expr(x + xn, y + yn);
  }

  // кастомный счетчик количества столбцов и строк
  public getRowsColsLen(data): { rLen: number; cLen: number } {
    const rKeys: number[] = [];
    const cKeys: number[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const key in data.rows) {
      if (key.match(/^[\d]*$/)) {
        rKeys.push(Number(key));
        cKeys.push(...Object.keys(data.rows[key].cells).map((d) => Number(d)));
      }
    }

    const rLen = +rKeys.sort((a, b) => a - b)[rKeys.length - 1] + 1;
    const cLen = +cKeys.sort((a, b) => a - b)[cKeys.length - 1] + 1;

    return { rLen, cLen };
  }
}
