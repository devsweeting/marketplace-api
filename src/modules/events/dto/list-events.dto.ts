import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { SortEnum } from '../enums/sort.enum';
import { ListDto } from 'modules/common/dto/list.dto';

export class ListEventsDto extends ListDto {
  @ApiPropertyOptional()
  @IsEnum(SortEnum)
  public sort: SortEnum = SortEnum.CreatedAt;
}
