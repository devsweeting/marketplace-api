import { Controller, Get, HttpCode, HttpStatus, Ip, Post, UseGuards } from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { User } from 'modules/users/entities';
import { ValidateFormBody } from '../decorators/form-validation.decorator';
import { CreateAccountDto } from '../dto/create-account.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import {
  IUserPaymentAccountResponse,
  IUserSynapseAccountResponse,
} from '../interfaces/create-account';
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
  public async verifyAddress(
    @ValidateFormBody() addressDto: VerifyAddressDto,
  ): Promise<{ status; address }> {
    const address = await this.synapseService.verifyAddress(addressDto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }

  @Get('user')
  @ApiOperation({
    summary: 'Returns the full payment account details',
    externalDocs: {
      description: 'Synapse User Documentation',
      url: 'https://docs.synapsefi.com/api-references/users/user-object-details',
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOtpAuthGuard)
  public async verifyUser(@GetUser() user: User): Promise<IUserPaymentAccountResponse> {
    const data = await this.synapseService.getSynapseUserDetails(user);
    return data;
  }

  @Post('user')
  @UseGuards(JwtOtpAuthGuard)
  public async createUser(
    @ValidateFormBody() createAccountDto: CreateAccountDto,
    @GetUser() user: User,
    @Ip() ip_address: Ipv4Address,
  ): Promise<IUserSynapseAccountResponse> {
    const response = await this.synapseService.createSynapseUserAccount(
      createAccountDto,
      user,
      ip_address,
    );
    return response;
  }
}
