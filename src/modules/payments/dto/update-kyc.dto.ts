import { PartialType } from '@nestjs/swagger';
import { BasicKycDto } from './basic-kyc.dto';

export class UpdateKycDto extends PartialType(BasicKycDto) {}
