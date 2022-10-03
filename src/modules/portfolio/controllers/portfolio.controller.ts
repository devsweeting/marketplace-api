import { Controller, Get, UseGuards } from '@nestjs/common';
import { PortfolioService } from '../portfolio.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import { User } from 'modules/users/entities';
import { currentUser } from 'modules/users/decorators/currentUser.decorator';
import { PortfolioTransformer } from '../portfolio.transformer';

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
  })
  public async getPortfolio(@currentUser() user: User) {
    const userPortfolio = await this.portfolioService.createUserPortfolio(user);
    return this.portfolioTransformer.transformPortfolio(userPortfolio);
  }
}
