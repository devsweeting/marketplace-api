/* eslint-disable no-magic-numbers */
import { Attribute, AssetAttributes } from '../entities';
import { Injectable } from '@nestjs/common';
import { AttributeResponse } from 'modules/assets/responses/attribute.response';

@Injectable()
export class AttributeTransformer {
  public transform(attribute: Attribute): AttributeResponse {
    return {
      trait: attribute.trait,
      value: attribute.value,
      display: attribute.display,
    };
  }

  public transformAll(attrs: AssetAttributes | undefined): AttributeResponse[] {
    const ret: AttributeResponse[] = [];
    if (attrs !== undefined) {
      for (const [k, v] of Object.entries(attrs)) {
        if (Array.isArray(v)) {
          for (const val of v) {
            ret.push({
              trait: k,
              value: val,
              display: null,
            });
          }
        } else {
          ret.push({
            trait: k,
            value: v,
            display: null,
          });
        }
      }
    }
    return ret.sort((a, b) => {
      if (a.trait === b.trait) {
        return a.value > b.value ? 1 : -1;
      }
      return a.trait > b.trait ? 1 : -1;
    });
  }
}
