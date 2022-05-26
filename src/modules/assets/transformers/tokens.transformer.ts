import { Attribute, Token } from '../entities';
import { Injectable } from '@nestjs/common';
import { TokenMetaResponse } from '../responses/tokens/token-meta.response';
import { TraitsResponse } from '../responses/tokens/traits.response';
import { TokenResponse } from '../responses/tokens/token.response';
import { TraitsMetaResponse } from '../responses/tokens/traits-meta.response';
import { MediaTransformer } from './media.transformer';

@Injectable()
export class TokensTransformer {
  public constructor(private readonly mediaTransformer: MediaTransformer) {}

  public transform(token: Token): TokenResponse {
    return {
      media: token.asset.media?.length
        ? this.mediaTransformer.transformAll(token.asset.media)
        : null,
      name: token.asset.name,
      description: token.asset.description,
      traits: token.asset.attributes
        ? this.traitsTransformAll<TraitsResponse>(token.asset.attributes)
        : [],
    };
  }

  public transformMeta(token: Token): TokenMetaResponse {
    return {
      media: token.asset.media?.length
        ? this.mediaTransformer.transformAll([token.asset.media[0]])
        : null,
      name: token.asset.name,
      description: token.asset.description,
      properties: token.asset.attributes
        ? this.traitsTransformAll<TraitsMetaResponse>(token.asset.attributes, true)
        : [],
    };
  }

  public traitsTransformAll<T>(attributes: Attribute[], meta = false): T[] {
    return attributes.map((attribute) =>
      meta ? this.traitMetaTransform(attribute) : this.traitTransform(attribute),
    ) as unknown as T[];
  }

  public traitTransform(attribute: Attribute): TraitsResponse {
    return {
      trait: attribute.trait,
      display: attribute.display,
      value: attribute.value,
      maxValue: attribute.maxValue,
    };
  }

  public traitMetaTransform(attribute: Attribute): TraitsMetaResponse {
    return {
      trait_type: attribute.trait,
      display_type: attribute.display ? attribute.display : null,
      value: attribute.value,
      max_value: attribute.maxValue ? attribute.maxValue : null,
    };
  }
}
