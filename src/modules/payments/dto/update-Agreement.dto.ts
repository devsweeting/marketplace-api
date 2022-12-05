import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { IAgreementStatus } from '../interfaces/create-account';

export class UpdateAgreementDto {
  @ApiProperty({ example: 'ACCEPTED' })
  @IsString()
  @IsNotEmpty()
  public agreement_status: IAgreementStatus;
}
