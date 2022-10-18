import { SortEnum } from '../enums/sort.enum';

export interface ISellOrderList {
  partnerId: string;
  slug?: string;
  assetId?: string;
  sort?: SortEnum;
}
