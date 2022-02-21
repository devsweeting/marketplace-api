import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, MaxLength, ValidateNested } from 'class-validator';
import { Attributes } from './attributes.dto';

export class PartnerAssetDto {
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({
    description: 'Reference ID from the partners system',
    required: true,
  })
  public refId: string;

  @IsNotEmpty()
  @MaxLength(255)
  @ApiProperty({
    description:
      'URI pointing to asset image.  Must be less than 255 characters.',
    required: true,
  })
  public image: string;

  @IsNotEmpty()
  @MaxLength(50)
  @ApiProperty({
    description: 'Name of the asset. Must be less than 50 characters.',
    required: true,
  })
  public name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Full description of the asset.',
    required: true,
  })
  public description: string;

  @ApiProperty({
    description:
      'Array of attributes defining the characteristics of the asset.',
    type: [Attributes],
  })
  @ValidateNested({ each: true })
  @Type(() => Attributes)
  public attributes: Attributes[];

  @ApiProperty()
  public collection: {
    name: string;
    family: string;
  };
}
