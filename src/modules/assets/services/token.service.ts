import { Injectable } from '@nestjs/common';
import { TokenDto } from '../dto/token.dto';
import { Token } from '../entities';
import { TokenNotFoundException } from '../exceptions/token-not-found.exception';

@Injectable()
export class TokensService {
  public async getToken(dto: TokenDto): Promise<Token> {
    const { tokenId, contractAddress } = dto;
    const token = await Token.findOne({
      where: { tokenId, contract: { address: contractAddress }, isDeleted: false },
      relations: [
        'asset',
        'asset.attributes',
        'asset.image',
        'partner',
        'contract',
        'partner.avatar',
        'partner.logo',
        'partner.banner',
      ],
    });
    if (!token) {
      throw new TokenNotFoundException();
    }
    return token;
  }
}
