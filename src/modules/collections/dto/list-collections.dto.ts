import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

import { ListDto } from 'modules/common/dto/list.dto';
import { SortEnum } from '../enums/sort.enum';

export class ListCollectionsDto extends ListDto {
  @ApiPropertyOptional()
  @IsEnum(SortEnum)
  public sort: SortEnum = SortEnum.CreatedAt;
}
