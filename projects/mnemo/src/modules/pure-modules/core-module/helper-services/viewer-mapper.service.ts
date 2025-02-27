/* eslint-disable import/no-extraneous-dependencies */
import { Injectable } from '@angular/core';
import { TluiLCLineInputData, TluiLCLineInputDataIconEnum } from '@tl-platform/ui';
import { IOMAttributeValues, IPoint, ITagsValues } from '../../../../models';

@Injectable()
export class ViewerMapperService {
  public prepareTagDataMapWS(tag: ITagsValues): TluiLCLineInputData {
    if (tag.status === 0) {
      return [new Date(tag.time), null];
    }
    return [new Date(tag.time), tag.val];
  }

  public prepareTagDataMapRest(tag: IPoint, exponent: number = 1): TluiLCLineInputData {
    if (tag.status === 0) {
      return [new Date(tag.time), null];
    }
    return [new Date(tag.time), tag.val * exponent];
  }

  public prepareTagDataMapEnum(tag: IPoint, index: number): TluiLCLineInputDataIconEnum {
    if (tag.status === 0) {
      return [index, null, null, tag.time?.toString()];
    }
    return [index, tag.val, null, tag.time?.toString()];
  }

  public prepareOmAttrDataMapRest(attr: IOMAttributeValues, exponent: number = 1): TluiLCLineInputData {
    if (attr.isGood && typeof attr.value === 'number') {
      return [new Date(attr.timeStamp), attr.value * exponent];
    }
    return [new Date(attr.timeStamp), null];
  }
}
