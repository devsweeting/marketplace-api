import { Optional } from '@nestjs/common';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { BasicKycDto } from './basic-kyc.dto';
import { VerifyAddressDto } from './verify-address.dto';

// This class is almost identical to the BasicKyc, the only difference is that mailing information is optional
export class PaymentsAccountDto extends OmitType(BasicKycDto, ['mailing_address'] as const) {
  @ApiProperty()
  @ValidateNested({ each: true })
  @Optional()
  @Type(() => VerifyAddressDto)
  public mailing_address: VerifyAddressDto;
}
