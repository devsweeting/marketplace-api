import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ListDto } from 'modules/common/dto/list.dto';
import { SortEnum } from '../enums/sort.enum';

export class ListSellOrderDto extends ListDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsUUID(4)
  public partnerId: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsEmail()
  @IsOptional()
  public email: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  public slug: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsUUID(4)
  @IsOptional()
  public assetId: string;

  @ApiPropertyOptional()
  @IsEnum(SortEnum)
  public sort: SortEnum = SortEnum.CreatedAt;
}
