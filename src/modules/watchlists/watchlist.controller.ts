import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  InternalServerErrorException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtAuthGuard from 'modules/auth/guards/jwt-auth.guard';
import { User } from 'modules/users/entities/user.entity';
import { WatchlistDto, WatchlistIdDto } from './dto';
import { WatchlistResponse } from './interfaces/watchlist.interface';

import { WatchlistTransformer } from './transformers/watchlist.transformer';
import { WatchlistService } from './watchlist.service';

@ApiTags('watchlist')
@Controller({
  path: 'watchlist',
  version: '1',
})
export class WatchlistController {
  constructor(
    private readonly watchlistService: WatchlistService,
    private readonly watchlistTransformer: WatchlistTransformer,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('')
  @ApiOperation({ summary: 'Return asset ids' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assets ids',
  })
  @HttpCode(HttpStatus.OK)
  public async get(@GetUser() user: User): Promise<WatchlistResponse | []> {
    const watchlist = await this.watchlistService.getWatchlist(user);

    return this.watchlistTransformer.transform(watchlist);
  }

  @UseGuards(JwtAuthGuard)
  @Post('')
  @ApiOperation({ summary: 'Add or re-add an asset to watchlist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asset is added to watchlist',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(@GetUser() user: User, @Body() dto: WatchlistDto) {
    const watchlistAsset = await this.watchlistService.assignAssetToWatchlist(user, dto);
    if (!watchlistAsset) {
      throw new InternalServerErrorException();
    }
    return {
      status: 201,
      description: 'Asset is added to watchlist',
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':assetId')
  @ApiOperation({ summary: 'Delete an asset from watchlist' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Asset deleted',
  })
  @ApiNotFoundResponse({
    description: 'Watchlist not found',
  })
  public async delete(@GetUser() user: User, @Param() params: WatchlistIdDto): Promise<void> {
    await this.watchlistService.deleteAssetFromWatchlist(user, params.assetId);
  }
}