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
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { SellOrdersService } from '../sell-orders.service';
import { PaginatedResponse } from 'modules/common/dto/paginated.response';
import { generateSwaggerPaginatedSchema } from 'modules/common/helpers/generate-swagger-paginated-schema';
import {
  SellOrderCheckResponse,
  SellOrderPurchaseValidateResponse,
  SellOrderResponse,
} from '../responses/sell-order.response';
import { SellOrderIdDto, SellOrderDto, ListSellOrderDto, SellOrderPurchaseDto } from '../dto';
import { SellOrdersTransformer } from '../transformers/sell-orders.transformer';
import { AuthGuard } from '@nestjs/passport';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from 'modules/partners/entities';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import { User } from 'modules/users/entities/user.entity';
import { SellOrderTypeEnum } from '../enums/sell-order-type.enum';
import { PurchaseHistoryDto } from '../dto/purchase-history.dto';
import { currentUser } from 'modules/users/decorators/currentUser.decorator';
import { SellOrdersPurchaseService } from '../sell-order-purchase.service';
import { SellOrderPurchaseResponse } from '../responses/sell-order-purchase.response';
import { SellOrderValidateDto } from '../dto/sell-order-validate.dto';

@ApiTags('sellorders')
@Controller({
  path: 'sellorders',
  version: '1',
})
export class SellOrdersController {
  constructor(
    private readonly sellOrdersService: SellOrdersService,
    private readonly sellOrdersPurchaseService: SellOrdersPurchaseService,
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

  @Get('/purchase-history')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Returns purchase history for specified asset' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of purchase history',
    type: SellOrderPurchaseResponse,
    isArray: true,
  })
  public async history(
    @Query() query: PurchaseHistoryDto,
    @currentUser() user: User,
  ): Promise<SellOrderPurchaseResponse[]> {
    const purchaseHistory = await this.sellOrdersPurchaseService.getUserPurchaseHistoryFromAsset(
      user,
      query.assetId,
    );
    return purchaseHistory?.sellOrderHistory;
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
    const sellOrder = await this.sellOrdersService.getOne(params, partner);

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
  public async create(
    @GetPartner() partner: Partner,
    @Body() dto: SellOrderDto,
  ): Promise<{ status: HttpStatus; description: string }> {
    try {
      await this.sellOrdersService.createSellOrder(partner, dto);
    } catch (e) {
      throw e;
    }
    return {
      status: HttpStatus.CREATED,
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
    await this.sellOrdersService.deleteSellOrder(partner, params);
  }

  @Post(':id/purchase')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Purchase fractions from sell order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Sell order created',
  })
  public async purchase(
    @GetUser() user: User,
    @Param() params: SellOrderIdDto,
    @Body() dto: SellOrderPurchaseDto,
  ): Promise<void> {
    await this.sellOrdersService.purchase(user, params, dto);
  }

  @Get(':id/check')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({ summary: 'Check if user can purchase shares from sell order' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User can purchase shares from sell order',
  })
  public async check(
    @GetUser() user: User,
    @Param() params: SellOrderIdDto,
  ): Promise<SellOrderCheckResponse> {
    const sellOrder = await this.sellOrdersService.getOne(params);
    const fractionsPurchased = Number(await this.sellOrdersService.checkDrop(user, sellOrder));
    let fractionsAvailableToPurchase: number;
    if (
      sellOrder.type === SellOrderTypeEnum.drop &&
      sellOrder.userFractionLimitEndTime > new Date()
    ) {
      fractionsAvailableToPurchase = sellOrder.userFractionLimit - fractionsPurchased;
    } else {
      fractionsAvailableToPurchase = sellOrder.fractionQtyAvailable;
    }
    return {
      fractionsPurchased,
      fractionsAvailableToPurchase,
    };
  }

  @Post(':id/validate')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiOperation({
    summary:
      'runs the same pre-check validations that happen before a purchase, without actually purchasing',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'validate a fraction transfer will process successfully',
  })
  public async validatePurchase(
    @GetUser() user: User,
    @Param() params: SellOrderIdDto,
    @Body() dto: SellOrderValidateDto,
  ): Promise<SellOrderPurchaseValidateResponse> {
    const validationStatus = await this.sellOrdersService.validatePurchase(user, params, dto);
    return validationStatus;
  }
}
