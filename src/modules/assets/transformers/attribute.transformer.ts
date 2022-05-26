import { Attribute } from '../entities';
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

  public transformAll(assets: Attribute[]): AttributeResponse[] {
    return assets.map((asset) => this.transform(asset));
  }
}
