import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
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

  @Get('user')
  //@UseGuards(JwtOtpAuthGuard)
  public async verifyUser() {
    const devinTestId = '6349aee07846615efe8e9521';
    // const wrongId = '6349aee07846615efe8e95xx';
    const user = await this.synapseService.viewUserDetails(devinTestId);
    return {
      status: HttpStatus.OK,
      user,
    };
  }
}
