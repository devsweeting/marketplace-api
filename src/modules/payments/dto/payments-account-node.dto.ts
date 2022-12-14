import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { BasicKycDto } from './basic-kyc.dto';
import { VerifyAddressDto } from './verify-address.dto';

// This class is almost identical to the BasicKyc, the only difference is that mailing information is optional
export class PaymentsAccountNodeDto extends PartialType(BasicKycDto) {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VerifyAddressDto)
  public mailing_address: VerifyAddressDto;
}
