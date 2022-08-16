import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetsService, TrendingMarket } from '../services/assets.service';

class TrendingMarketsResponse {
  constructor(public markets: TrendingMarket[]) {}
}

@ApiTags('trending')
@Controller({
  path: 'trending',
  version: '1',
})
export class TrendingController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  @ApiOperation({ summary: 'Return list of trending markets, grouped by brand' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assets',
    type: TrendingMarketsResponse,
  })
  public async trending(): Promise<TrendingMarketsResponse> {
    const markets = await this.assetsService.getTrending();
    return new TrendingMarketsResponse(markets);
  }
}
