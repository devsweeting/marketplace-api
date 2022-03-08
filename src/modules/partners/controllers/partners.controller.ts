import { Body, Controller, Param, Post } from '@nestjs/common';
import { ApiBasicAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransferRequestDto } from 'modules/partners/dto';
import { PartnersService } from '../services/partners.service';

@ApiTags('partners')
@Controller('partners')
@ApiBasicAuth('api-key')
// @UseGuards(AuthGuard('headerapikey'))
export class PartnersController {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private readonly partnersService: PartnersService) {}

  @Post(':partnerId/assets')
  @ApiOperation({ summary: 'Move a partner asset to the blockchain' })
  @ApiResponse({
    status: 201,
    description: 'Transfer request accepted, processing.',
  })
  public async transfer(@Param('partnerId') partnerId: string, @Body() dto: TransferRequestDto) {
    // return this.partnersService.recordTransferRequest(partnerId, dto);
    return {
      status: 201,
      description: 'Transfer request accepted, processing.',
    };
  }
}
