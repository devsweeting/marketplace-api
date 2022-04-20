import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { SortEnum } from '../enums/sort.enum';
import { ListDto } from 'modules/common/dto/list.dto';

export class ListAssetsDto extends ListDto {
  @ApiPropertyOptional()
  @IsEnum(SortEnum)
  public sort: SortEnum = SortEnum.CreatedAt;

  @ApiPropertyOptional()
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public search?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  public label_eq?: string;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  public attr_eq?: string[];

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  public attr_gte?: any;

  @ApiPropertyOptional()
  @IsNotEmpty()
  @IsOptional()
  public attr_lte?: any;
}
