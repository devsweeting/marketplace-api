import { Injectable } from '@nestjs/common';
import { TokenDto } from '../dto/token.dto';
import { Token } from '../entities';
import { TokenNotFoundException } from '../exceptions/token-not-found.exception';
import { validate as isValidUUID } from 'uuid';
import { IsNotUuidException } from '../exceptions/is-not-uuid.exception';

@Injectable()
export class TokensService {
  public async getToken(dto: TokenDto): Promise<Token> {
    const { tokenId, contractAddress } = dto;

    if (!isValidUUID(tokenId.replace('.json', ''))) {
      throw new IsNotUuidException();
    }
    const token = await Token.findOne({
      where: {
        tokenId: tokenId.replace('.json', ''),
        contract: { address: contractAddress },
        isDeleted: false,
      },
      relations: ['asset', 'contract', 'asset.media', 'asset.media.file'],
    });
    if (!token) {
      throw new TokenNotFoundException();
    }
    return token;
  }
}
