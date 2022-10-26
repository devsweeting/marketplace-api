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
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import { User } from 'modules/users/entities/user.entity';
import { ListWatchlistDto, AssetIdOrSlugDto, WatchlistDto, WatchlistIdDto } from './dto';
import { WatchlistCheckAssetResponse } from './responses/watchlist-check-asset.response';
import { WatchlistAssetResponse } from './responses/watchlist.response';

import { WatchlistTransformer } from './transformers/watchlist.transformer';
import { WatchlistService } from './watchlist.service';
import { validate as isValidUUID } from 'uuid';
import { StatusCodes } from 'http-status-codes';
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

  @Get()
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Return list of assets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assets',
    schema: generateSwaggerPaginatedSchema(WatchlistAssetResponse),
  })
  @HttpCode(HttpStatus.OK)
  public async get(
    @Query() params: ListWatchlistDto,
    @GetUser() user: User,
  ): Promise<PaginatedResponse<WatchlistAssetResponse>> {
    const watchlist = await this.watchlistService.getWatchlist(params, user);

    return this.watchlistTransformer.transformPaginated(watchlist);
  }

  @Post()
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Add or re-add an asset to watchlist' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asset was added to watchlist',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(
    @GetUser() user: User,
    @Body() dto: WatchlistDto,
  ): Promise<{ status: StatusCodes; description: string }> {
    const watchlistAsset = await this.watchlistService.assignAssetToWatchlist(user, dto);
    if (!watchlistAsset) {
      throw new InternalServerErrorException();
    }
    return {
      status: StatusCodes.CREATED,
      description: 'Asset was added to watchlist',
    };
  }

  @Delete(':assetId')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
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

  @Get('check/:checkParams')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Check an asset in watchlist' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset checked',
  })
  @ApiNotFoundResponse({
    description: 'Asset not found',
  })
  @HttpCode(HttpStatus.OK)
  public async checkAssetInWatchlist(
    @GetUser() user: User,
    @Param() params: AssetIdOrSlugDto,
  ): Promise<WatchlistCheckAssetResponse> {
    let watchlist;
    if (isValidUUID(params.checkParams)) {
      watchlist = await this.watchlistService.checkAssetInWatchlist({
        assetId: params.checkParams,
        slug: null,
        user,
      });
    } else {
      watchlist = await this.watchlistService.checkAssetInWatchlist({
        assetId: null,
        slug: params.checkParams,
        user,
      });
    }
    return watchlist;
  }
}
