import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AssetsService } from 'modules/assets/assets.service';
import { AssetsTransformer } from 'modules/assets/transformers/assets.transformer';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from 'modules/partners/entities';
import { TransferRequestDto } from 'modules/assets/dto';
import { ListAssetsDto } from 'modules/assets/dto/list-assets.dto';
import { AssetResponse } from 'modules/assets/interfaces/response/asset.response';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import { AssetIdDto } from 'modules/assets/dto/asset-id.dto';
import { UpdateAssetDto } from 'modules/assets/dto/update-asset.dto';

@ApiTags('assets')
@Controller('assets')
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly assetsTransformer: AssetsTransformer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Return list of assets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of assets',
    schema: generateSwaggerPaginatedSchema(AssetResponse),
  })
  public async list(@Query() params: ListAssetsDto): Promise<PaginatedResponse<AssetResponse>> {
    const list = await this.assetsService.getList(params);

    return this.assetsTransformer.transformPaginated(list);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns single asset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'An assets',
    type: AssetResponse,
  })
  public async getOne(@Param() params: AssetIdDto): Promise<AssetResponse> {
    const asset = await this.assetsService.getOne(params.id);

    return this.assetsTransformer.transform(asset);
  }

  @Delete(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Delete an asset' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Asset deleted',
  })
  @ApiNotFoundResponse({
    description: 'Asset not found',
  })
  public async delete(@GetPartner() partner: Partner, @Param() params: AssetIdDto): Promise<void> {
    await this.assetsService.deleteAsset(partner, params.id);
  }

  @Patch(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Update an asset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Asset updated',
    type: AssetResponse,
  })
  @ApiNotFoundResponse({
    description: 'Asset not found',
  })
  @ApiConflictResponse({
    description: 'Ref id or name already taken',
  })
  @HttpCode(HttpStatus.OK)
  public async update(
    @GetPartner() partner: Partner,
    @Param() params: AssetIdDto,
    @Body() dto: UpdateAssetDto,
  ): Promise<AssetResponse> {
    const asset = await this.assetsService.updateAsset(partner, params.id, dto);

    return this.assetsTransformer.transform(asset);
  }

  @Post()
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transfer request accepted, processing.',
  })
  public async transfer(@GetPartner() partner: Partner, @Body() dto: TransferRequestDto) {
    await this.assetsService.recordTransferRequest(partner.id, dto);

    return {
      status: 201,
      description: 'Transfer request accepted, processing.',
    };
  }
}
