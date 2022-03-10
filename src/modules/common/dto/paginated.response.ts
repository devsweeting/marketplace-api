import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from 'nestjs-typeorm-paginate';

export class PaginationMeta implements IPaginationMeta {
  @ApiProperty({ example: 10 })
  public itemCount: number;

  @ApiProperty({ example: 100 })
  public totalItems?: number;

  @ApiProperty({ example: 10 })
  public itemsPerPage: number;

  @ApiProperty({ example: 10 })
  public totalPages?: number;

  @ApiProperty({ example: 1 })
  public currentPage: number;
}

export class PaginatedResponse<T> {
  @ApiProperty({ type: PaginationMeta })
  public meta: IPaginationMeta;

  @ApiProperty({ isArray: true })
  public items: T[];
}
