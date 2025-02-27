/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { Base64 } from 'jsencrypt/lib/lib/asn1js/base64';
import * as pako from 'pako';

@Injectable()
export class ViewerDecodeService {
  public decode(data: string): string {
    try {
      const node = this.parseXml(data).documentElement;
      if (node?.nodeName === 'mxGraphModel') {
        return data;
      }
    } catch (e) {
      // ignore
    }

    try {
      const node = this.parseXml(data).documentElement;
      if (node != null && node.nodeName === 'mxfile') {
        const diagrams = node.getElementsByTagName('diagram');
        if (diagrams.length > 0) {
          data = this.getTextContent(diagrams[0]);
        }
      }
    } catch (e) {
      // ignore
    }
    try {
      data = atob(data);
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      alert(`atob failed: ${e}`);
      return '';
    }
    try {
      data = pako.inflateRaw(
        Uint8Array.from(data, (c) => (c as unknown as string).charCodeAt(0)),
        { to: 'string' }
      );
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      alert(`inflateRaw failed: ${e}`);
      return '';
    }
    try {
      data = decodeURIComponent(data);
    } catch (e) {
      console.log(e);
      // eslint-disable-next-line no-alert
      alert(`decodeURIComponent failed: ${e}`);
      return '';
    }
    return data;
  }

  public decompress(data: string, inflate?: boolean, checked?: boolean): string {
    if (data == null || data.length === 0 || typeof pako === 'undefined') {
      return data;
    }
    // @ts-ignore
    const tmp = Base64.decode(data, true);

    const inflated = decodeURIComponent(
      inflate ? pako.inflate(tmp, { to: 'string' }) : pako.inflateRaw(tmp, { to: 'string' })
    );

    return checked ? inflated : this.zapGremlins(inflated);
  }

  private parseXml(xml: string): Document {
    if (window.DOMParser) {
      const parser = new DOMParser();
      return parser.parseFromString(xml, 'text/xml');
    }

    return null;
  }

  private getTextContent(node: Element): string {
    return node ? node[node.textContent === undefined ? 'text' : 'textContent'] : '';
  }

  private zapGremlins(text: string): string {
    let lastIndex = 0;
    const checked = [];

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < text.length; i++) {
      const code = text.charCodeAt(i);

      // Removes all control chars except TAB, LF and CR
      if (!((code >= 32 || code === 9 || code === 10 || code === 13) && code !== 0xffff && code !== 0xfffe)) {
        checked.push(text.substring(lastIndex, i));
        lastIndex = i + 1;
      }
    }

    if (lastIndex > 0 && lastIndex < text.length) {
      checked.push(text.substring(lastIndex));
    }

    return checked.length === 0 ? text : checked.join('');
  }
}
