import { Attribute, Token } from '../entities';
import { Injectable } from '@nestjs/common';
import { TokenMetaResponse } from '../interfaces/response/tokens/token-meta.response';
import { StorageService } from 'modules/storage/storage.service';
import { TraitsResponse } from '../interfaces/response/tokens/traits.response';
import { TokenResponse } from '../interfaces/response/tokens/token.response';
import { TraitsMetaResponse } from '../interfaces/response/tokens/traits-meta.response';

@Injectable()
export class TokensTransformer {
  public constructor(private readonly storageService: StorageService) {}

  public transform(token: Token): TokenResponse {
    return {
      image: token.asset.image ? this.storageService.getUrl(token.asset.image) : null,
      name: token.asset.name,
      description: token.asset.description,
      externalUrl: token.asset.externalUrl,
      traits: token.asset.attributes
        ? this.traitsTransformAll<TraitsResponse>(token.asset.attributes)
        : [],
    };
  }

  public transformMeta(token: Token): TokenMetaResponse {
    return {
      image: token.asset.image ? this.storageService.getUrl(token.asset.image) : null,
      name: token.asset.name,
      description: token.asset.description,
      external_link: token.asset.externalUrl,
      traits: token.asset.attributes
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
