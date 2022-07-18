import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBasicAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SellOrdersService } from '../sell-orders.service';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import { SellOrderResponse } from '../responses/sell-order.response';
import { SellOrderIdDto, SellOrderDto, ListSellOrderDto } from '../dto';
import { SellOrdersTransformer } from '../transformers/sell-orders.transformer';
import { AuthGuard } from '@nestjs/passport';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from 'modules/partners/entities';

@ApiTags('sellorders')
@Controller({
  path: 'sellorders',
  version: '1',
})
export class SellOrdersController {
  constructor(
    private readonly sellOrdersService: SellOrdersService,
    private readonly sellOrdersTransformer: SellOrdersTransformer,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Return list of sell orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of sell order',
    schema: generateSwaggerPaginatedSchema(SellOrderResponse),
  })
  public async list(
    @Query() params: ListSellOrderDto,
  ): Promise<PaginatedResponse<SellOrderResponse>> {
    const list = await this.sellOrdersService.getList(params);
    return this.sellOrdersTransformer.transformPaginated(list);
  }

  @Get(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Returns single sell order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'A sell order',
    type: SellOrderResponse,
  })
  public async getOne(
    @GetPartner() partner: Partner,
    @Param() params: SellOrderIdDto,
  ): Promise<SellOrderResponse> {
    const sellOrder = await this.sellOrdersService.getOne(partner, params.id);

    return this.sellOrdersTransformer.transform(sellOrder);
  }

  @Post()
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Create a sell order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sell order created',
  })
  @HttpCode(HttpStatus.CREATED)
  public async create(@GetPartner() partner: Partner, @Body() dto: SellOrderDto) {
    try {
      await this.sellOrdersService.createSellOrder(partner, dto);
    } catch (e) {
      throw e;
    }
    return {
      status: 201,
      description: 'Sell order created',
    };
  }

  @Delete(':id')
  @ApiBasicAuth('api-key')
  @UseGuards(AuthGuard('headerapikey'))
  @ApiOperation({ summary: 'Delete a sell order' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Sell Order deleted',
  })
  @ApiNotFoundResponse({
    description: 'Sell Order not found',
  })
  public async delete(
    @GetPartner() partner: Partner,
    @Param() params: SellOrderIdDto,
  ): Promise<void> {
    await this.sellOrdersService.deleteSellOrder(partner, params.id);
  }
}
