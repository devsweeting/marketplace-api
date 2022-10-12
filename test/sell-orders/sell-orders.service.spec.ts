import { SellOrderIdDto } from 'modules/sell-orders/dto';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrdersService } from 'modules/sell-orders/sell-orders.service';
import { BaseEntity } from 'typeorm';
jest.mock('modules/sell-orders/entities');

const mockedSellOrder = SellOrder as jest.Mocked<typeof SellOrder>;
/* eslint-disable  @typescript-eslint/no-explicit-any */
let service: SellOrdersService;
beforeEach(async () => {
  const createQueryBuilder: any = {
    where: () => createQueryBuilder,
    andWhere: () => createQueryBuilder,
    select: () => createQueryBuilder,
    addSelect: () => createQueryBuilder,
    groupBy: () => createQueryBuilder,
    getOne: () => createQueryBuilder,
    getRawMany: () => undefined,
  };

  jest.spyOn(SellOrder, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);

  service = new SellOrdersService();
});

afterEach(async () => {
  jest.resetAllMocks();
});

describe('SellOrdersService', () => {
  describe('getOne', () => {
    test('should throw error if sellOrder is undefined', async () => {
      const result = service.getOne('123' as unknown as SellOrderIdDto);
      expect(result).toThrowError();
    });
  });

  describe('createSellOrder', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('checkDrop', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('deleteSellOrder', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('purchase', () => {
    test('should first', async () => {
      test.todo;
    });
  });

  describe('getUserSellOrder', () => {
    test('should first', async () => {
      test.todo;
    });
  });
});
