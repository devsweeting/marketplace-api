import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferRequestDto } from '../dto';
import { PartnersService } from '../services/partners.service';
import { AuthGuard } from '@nestjs/passport';
import { GetPartner } from 'modules/auth/decorators/get-partner.decorator';
import { Partner } from 'modules/partners/entities';
import { AssetsTransformer } from 'modules/partners/transformers/assets.transformer';

@ApiTags('partners')
@Controller('partners')
@ApiBasicAuth('api-key')
@UseGuards(AuthGuard('headerapikey'))
export class PartnersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(
    private readonly partnersService: PartnersService,
    private readonly assetsTransformer: AssetsTransformer,
  ) {}

  @Post('assets')
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: 201,
    description: 'Transfer request accepted, processing.',
  })
  public async transfer(@GetPartner() partner: Partner, @Body() dto: TransferRequestDto) {
    await this.partnersService.recordTransferRequest(partner.id, dto);

    return {
      status: 201,
      description: 'Transfer request accepted, processing.',
    };
  }
}
