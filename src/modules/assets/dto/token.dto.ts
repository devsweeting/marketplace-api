import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class TokenDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public tokenId: string;

  @ApiProperty()
  @IsNotEmpty()
  public contractAddress: string;

  @ApiPropertyOptional()
  @IsOptional()
  public ext?: string;
}
