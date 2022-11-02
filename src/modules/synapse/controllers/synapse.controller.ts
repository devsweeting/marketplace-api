import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { User } from 'modules/users/entities';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { IUserSynapseAccountResponse } from '../interfaces/create-account';
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
  @ApiOperation({ summary: 'Verifies if an address is deliverable' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  public async verifyAddress(@Body() dto: VerifyAddressDto): Promise<{ status; address }> {
    const address = await this.synapseService.verifyAddress(dto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }

  @Get('user')
  // @UseGuards(JwtOtpAuthGuard)
  public async verifyUser(): Promise<{ status; data }> {
    const devinTestSynapseId = '6349aee07846615efe8e9521';
    // const wrongId = '6349aee07846615efe8e95xx';
    const user = await this.synapseService.getSynapseUserDetails(devinTestSynapseId);
    return {
      status: HttpStatus.OK,
      data: user.userData,
    };
  }

  @Post('user')
  @UseGuards(JwtOtpAuthGuard)
  public async createUser(
    @Body() dto: CreateAccountDto,
    @GetUser() user: User,
    @Ip() ip_address: Ipv4Address,
  ): Promise<IUserSynapseAccountResponse> {
    const response = await this.synapseService.createSynapseUserAccount(dto, user, ip_address);
    return response;
  }
}
