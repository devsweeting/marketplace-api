import { fromPairs } from 'lodash';
import { IQuery } from '../interfaces/IQuery';

export abstract class BaseService {
  protected getFindAllQuery(query: IQuery): {
    skip: number;
    take: number;
    order: string | Record<string, string>;
    where: {
      search?: string;
      attr_eq?: object;
      attr_gte?: object;
      attr_lte?: object;
      partner: string;
      where?: unknown;
    };
  } {
    const { page, skip, limit, sort, ...where } = query;
    return {
      // eslint-disable-next-line no-magic-numbers
      skip: skip > 0 ? skip : (page - 1) * limit,
      take: limit,
      order: sort ? fromPairs([sort]) : {},
      where,
    };
  }
}
