import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { SynapseService } from '../providers/synapse.service';

@ApiTags('synapse')
@Controller({
  path: 'synapse',
  version: '1',
})
export class SynapseController {
  constructor(private readonly synapseService: SynapseService) {}

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifies an address is deliverable' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  public async verifyAddress(@Body() dto: VerifyAddressDto) {
    const address = await this.synapseService.verifyAddress(dto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }
}
