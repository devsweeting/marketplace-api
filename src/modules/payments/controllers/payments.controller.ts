import {
  Body,
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
import { PaymentsAccountNodeDto } from '../dto/payments-account-node.dto';
import { PaymentsAccountDto } from '../dto/payments-account.dto';
import { UpdateAgreementDto } from '../dto/update-Agreement.dto';
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

  @Post('account')
  @ApiBody({
    type: PaymentsAccountDto,
  })
  @ApiOperation({
    summary: 'Creates a basic synapse account',
  })
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PaymentsAccountResponse,
  })
  public async createBasePaymentUser(
    @Headers() headers: Headers,
    @Ip() ip_address: Ipv4Address,
    @ValidateFormBody() submitKycDto: PaymentsAccountDto,
    @GetUser() user: User,
  ): Promise<IPaymentsAccountResponse> {
    const response = await this.paymentsService.createPaymentsAccount(
      submitKycDto,
      user,
      headers,
      ip_address,
    );
    return response;
  }

  @Post('account/node')
  @ApiBody({
    type: PaymentsAccountNodeDto,
  })
  @ApiOperation({
    summary: 'Creates a node on the Payments User',
  })
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: PaymentsAccountResponse,
  })
  public async createPaymentNode(
    @Headers() headers: Headers,
    @Ip() ip_address: Ipv4Address,
    @ValidateFormBody() submitKycDto: PaymentsAccountNodeDto,
    @GetUser() user: User,
  ): Promise<IPaymentsAccountResponse> {
    const response = await this.paymentsService.createPaymentNodeAccount(
      submitKycDto,
      user,
      headers,
      ip_address,
    );
    return response;
  }

  @Get('terms')
  @ApiOperation({ summary: 'Returns user agreement' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  public async termsAgreement(@GetUser() user: User) {
    const data = await this.paymentsService.getAgreementPreview(user);
    return data;
  }

  @Post('terms')
  @ApiBody({
    type: UpdateAgreementDto,
  })
  @ApiOperation({ summary: 'Saves to DB that users accepted a specific agreement' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('bearer-token')
  @UseGuards(JwtOtpAuthGuard)
  public async saveAgreement(
    @GetUser() user: User,
    @Body()
    agreementStatus: UpdateAgreementDto,
  ): Promise<{ status: HttpStatus; message: string }> {
    const data = this.paymentsService.saveAgreementAcknowledgement(
      user,
      agreementStatus.agreement_status,
    );
    return data;
  }

  @Post('address')
  @ApiBody({
    type: VerifyAddressDto,
  })
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
    const response = await this.paymentsService.createPaymentNodeAccount(
      submitKycDto,
      user,
      headers,
      ip_address,
    );
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
