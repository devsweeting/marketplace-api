export interface IQuery {
  sort: string;
  partner: string;
  page?: number;
  skip?: number;
  limit?: number;
  where?: {
    search?: string;
    attr_eq?: object;
    attr_gte?: object;
    attr_lte?: object;
  };
}
