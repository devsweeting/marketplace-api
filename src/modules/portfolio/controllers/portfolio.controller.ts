import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PortfolioService } from '../portfolio.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import { User } from 'modules/users/entities';
import { currentUser } from 'modules/users/decorators/currentUser.decorator';
import { PortfolioTransformer } from '../portfolio.transformer';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
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

  @Get('')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Returns list of the users purchases assets and active sell orders' })
  @ApiResponse({
    status: 200,
    description: 'returns the users purchased assets and active sell orders',
    schema: generateSwaggerPaginatedSchema(PortfolioResponse),
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
