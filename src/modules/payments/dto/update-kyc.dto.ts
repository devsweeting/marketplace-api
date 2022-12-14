import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { BasicKycDto } from './basic-kyc.dto';
import { VerifyAddressDto } from './verify-address.dto';

export class UpdateKycDto extends PartialType(BasicKycDto) {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => VerifyAddressDto)
  public mailing_address: VerifyAddressDto;
}
