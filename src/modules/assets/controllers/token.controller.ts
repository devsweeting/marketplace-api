import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenDto } from '../dto/token.dto';
import { TokenMetaResponse } from '../interfaces/response/tokens/token-meta.response';
import { TokenResponse } from '../interfaces/response/tokens/token.response';
import { TokensService } from '../services/token.service';
import { TokensTransformer } from '../transformers/tokens.transformer';

@ApiTags('nft')
@Controller('nft')
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensTransformer: TokensTransformer,
  ) {}

  @Get('meta/:contractAddress/:tokenId.:ext?')
  @ApiOperation({ summary: 'Returns meta single token for address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meta Single token',
    type: TokenMetaResponse,
  })
  public async getTokenMeta(@Param() params: TokenDto): Promise<string | TokenMetaResponse> {
    const token = await this.tokensService.getTokenMeta(params);
    const res = this.tokensTransformer.transformMeta(token);
    return params.ext === 'json' ? JSON.stringify(res) : res;
  }

  @Get(':contractAddress/:tokenId')
  @ApiOperation({ summary: 'Returns single token for address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Single token',
    type: TokenResponse,
  })
  public async getToken(@Param() params: TokenDto): Promise<TokenResponse> {
    const token = await this.tokensService.getToken(params);
    return this.tokensTransformer.transform(token);
  }
}
