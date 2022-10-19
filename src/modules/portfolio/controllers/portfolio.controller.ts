import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PortfolioService } from '../portfolio.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import { User } from 'modules/users/entities';
import { currentUser } from 'modules/users/decorators/currentUser.decorator';
import { PortfolioTransformer } from '../portfolio.transformer';
import { PortfolioResponse } from '../responses';
import { PortfolioDto } from '../portfolioDto';

@ApiTags('portfolio')
@Controller({
  path: 'portfolio',
  version: '1',
})
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly portfolioTransformer: PortfolioTransformer,
  ) {}

  @Get()
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Returns list of the users purchases assets and active sell orders' })
  @ApiResponse({
    status: 200,
    description:
      'returns list of assets user owns, valuation of those assets and the total number of assets owned',
    schema: { $ref: getSchemaPath(PortfolioResponse) },
  })
  public async list(
    @Query()
    params: PortfolioDto,
    @currentUser() user: User,
  ) {
    const userPortfolio = await this.portfolioService.getUserPortfolio(params, user);
    return this.portfolioTransformer.transformPortfolio(userPortfolio);
  }
}
