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

import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Ipv4Address } from 'aws-sdk/clients/inspector';
import { GetUser } from 'modules/auth/decorators/get-user.decorator';
import JwtOtpAuthGuard from 'modules/auth/guards/jwt-otp-auth.guard';
import { User } from 'modules/users/entities';
import { ValidateFormBody } from '../decorators/form-validation.decorator';
import { BasicKycDto } from '../dto/basic-kyc.dto';
import { UpdateKycDto } from '../dto/update-kyc.dto';
import { VerifyAddressDto } from '../dto/verify-address.dto';
import { IPaymentsAccountResponse } from '../interfaces/create-account';
import { PaymentsService } from '../providers/payments.service';
import {
  PaymentsAccountResponse,
  UpdatePaymentsAccountResponse,
  UserPaymentAccountResponse,
} from '../responses/payment-response';

@ApiTags('payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}
  @ApiBody({
    type: VerifyAddressDto,
  })
  @Post('address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verifies if an address is deliverable' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  public async verifyAddress(
    @ValidateFormBody()
    addressDto: VerifyAddressDto,
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
    type: UserPaymentAccountResponse,
  })
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  public async verifyUser(@GetUser() user: User): Promise<UserPaymentAccountResponse> {
    const data = await this.paymentsService.getPaymentAccountDetails(user);
    return data;
  }

  @ApiBody({
    type: BasicKycDto,
  })
  @Post('kyc')
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PaymentsAccountResponse,
  })
  public async createUser(
    @Headers() headers: Headers,
    @Ip() ip_address: Ipv4Address,
    @ValidateFormBody() submitKycDto: BasicKycDto,
    @GetUser() user: User,
  ): Promise<IPaymentsAccountResponse> {
    const response = await this.paymentsService.submitKYC(submitKycDto, user, headers, ip_address);
    return response;
  }

  @ApiBody({
    type: UpdateKycDto,
  })
  @Post('update-kyc')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    type: UpdatePaymentsAccountResponse,
  })
  public async updateUser(
    @ValidateFormBody()
    submitKycDto: UpdateKycDto,
    @GetUser() user: User,
    @Ip() ip_address: Ipv4Address,
  ): Promise<UpdatePaymentsAccountResponse> {
    const response = await this.paymentsService.updateKyc(submitKycDto, user, ip_address);
    return response;
  }
}
