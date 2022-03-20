import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsDefined, IsNotEmptyObject, ValidateNested } from 'class-validator';
import { AssetDto } from 'modules/assets/dto';

import { PartnerUserDto } from './';

export class TransferRequestDto {
  @ApiProperty({
    description: 'User information.',
    required: true,
    type: () => PartnerUserDto,
  })
  @IsNotEmptyObject()
  @Type(() => PartnerUserDto)
  @ValidateNested()
  public user: PartnerUserDto;

  @ApiProperty({
    description: 'Description of the asset to be transferred.',
    type: AssetDto,
    required: true,
    isArray: true,
  })
  @ValidateNested({ each: true })
  @IsDefined()
  @ArrayMinSize(1)
  @Type(() => AssetDto)
  public assets: AssetDto[];
}
