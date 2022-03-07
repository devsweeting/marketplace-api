import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';

import { AssetDto, PartnerUserDto } from './';

export class TransferRequestDto {
  @ApiProperty({
    description: 'User information.',
    required: true,
  })
  @IsNotEmptyObject()
  @ValidateNested()
  @Type(() => PartnerUserDto)
  user: PartnerUserDto;

  @ApiProperty({
    description: 'Description of the asset to be transferred.',
    type: [AssetDto],
    required: true,
  })
  @ValidateNested({ each: true })
  @IsDefined()
  @ArrayMinSize(1)
  @Type(() => AssetDto)
  assets: AssetDto[];
}
