import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

const displayTypes = ['text', 'number', 'boolean', 'date'];

export class AttributeDto {
  @ApiProperty({ description: 'Attribute key type' })
  @IsNotEmpty()
  public trait: string;

  @ApiProperty({ description: 'Attribute value' })
  @IsNotEmpty()
  public value: string;

  @ApiProperty({
    description: 'Attribute display hint',
    required: false,
    enum: displayTypes,
  })
  @IsOptional()
  @IsEnum(displayTypes)
  public display?: string;
}
