import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { User } from 'modules/users/entities';
import { ValidateFormBody } from '../decorators/form-validation.decorator';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import {
  IUserPaymentAccountResponse,
  IPaymentsAccountResponse,
} from '../interfaces/create-account';
import { PaymentsService } from '../providers/payments.service';

@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifies if an address is deliverable' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  public async verifyAddress(
    @ValidateFormBody() addressDto: VerifyAddressDto,
  ): Promise<{ status; address }> {
    const address = await this.paymentsService.verifyAddress(addressDto);
    return {
      status: HttpStatus.OK,
      address,
    };
  }

  @Get('account')
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
    const data = await this.paymentsService.getPaymentAccountDetails(user);
    return data;
  }

  @Post('kyc')
  @UseGuards(JwtOtpAuthGuard)
  public async createUser(
    @ValidateFormBody() submitKycDto: BasicKycDto,
    @GetUser() user: User,
    @Ip() ip_address: Ipv4Address,
  ): Promise<IPaymentsAccountResponse> {
    const response = await this.paymentsService.submitKYC(submitKycDto, user, ip_address);
    return response;
  }

  @Get('node')
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @UseGuards(JwtOtpAuthGuard)
  public async getNodes(@GetUser() user: User, @Headers() headers: Headers): Promise<any> {
    const data = await this.paymentsService.createNode(user, headers);
    return data;
  }
}
