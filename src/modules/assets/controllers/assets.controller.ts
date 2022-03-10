import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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
    status: 200,
    description: 'List of assets',
    schema: generateSwaggerPaginatedSchema(AssetResponse),
  })
  public async list(@Query() params: ListAssetsDto): Promise<PaginatedResponse<AssetResponse>> {
    const list = await this.assetsService.getList(params);

    return this.assetsTransformer.transformPaginated(list);
  }

  @Post()
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: 201,
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
