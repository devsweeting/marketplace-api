import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { CreateAccountDto } from '../dto/create-account.dto';
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
  public async verifyAddress(@Body() dto: VerifyAddressDto): Promise<any> {
    const address = await this.synapseService.verifyAddress(dto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }

  @Get('user')
  //@UseGuards(JwtOtpAuthGuard)
  public async verifyUser(): Promise<any> {
    const devinTestSynapseId = '6349aee07846615efe8e9521';
    // const wrongId = '6349aee07846615efe8e95xx';
    const user = await this.synapseService.getSynapseUserDetails(devinTestSynapseId);
    return {
      apiStatus: HttpStatus.OK,
      data: user.userData,
    };
  }

  /* eslint-disable no-console */

  @Post('user')
  //@UseGuards(JwtOtpAuthGuard)
  public async createUser(
    @Body() dto: CreateAccountDto,
    @Ip() ip_address: Ipv4Address,
  ): Promise<any> {
    console.log('dto', dto);
    const response = await this.synapseService.createSynapseUserAccount(dto, ip_address);
    console.log('response', response);
    // return response;
  }
}
