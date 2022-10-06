import { SortEnum } from '../enums/sort.enum';

export interface IAssetListArgs {
  sort: SortEnum;
  search?: string;
  attr_eq?: object;
  attr_gte?: object;
  attr_lte?: object;
  partner?: string;
  user_id?: string;
  page?: number;
  limit?: number;
  order?: 'ASC' | 'DESC';
  query?: string;
}
