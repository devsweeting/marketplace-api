import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IAgreementType } from '../interfaces/create-account';

export class UpdateAgreementDto {
  @ApiProperty({ example: 'TERMS_AND_CONDITIONS' })
  @IsString()
  @IsNotEmpty()
  public agreement_type: IAgreementType;
}
