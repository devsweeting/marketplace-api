import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TokenDto } from '../dto/token.dto';
import { TokenMetaResponse } from '../responses/tokens/token-meta.response';
import { TokenResponse } from '../responses/tokens/token.response';
import { TokensService } from '../services/token.service';
import { TokensTransformer } from '../transformers/tokens.transformer';

@ApiTags('token')
@Controller({
  path: 'token',
  version: '1',
})
export class TokensController {
  constructor(
    private readonly tokensService: TokensService,
    private readonly tokensTransformer: TokensTransformer,
  ) {}

  @Get('meta/:contractAddress/:tokenId')
  @ApiOperation({ summary: 'Returns meta single token for address' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Meta Single token',
    type: TokenMetaResponse,
  })
  public async getTokenMeta(@Param() params: TokenDto): Promise<string | TokenMetaResponse> {
    const token = await this.tokensService.getToken(params);
    const res = this.tokensTransformer.transformMeta(token);
    return params.tokenId.split('.').pop() === 'json' ? JSON.stringify(res) : res;
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
