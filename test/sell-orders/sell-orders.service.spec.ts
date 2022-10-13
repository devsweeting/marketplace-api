import { UserNotFoundException } from 'modules/common/exceptions/user-not-found.exception';
import { SellOrderIdDto } from 'modules/sell-orders/dto';
import { SellOrder } from 'modules/sell-orders/entities';
import { SellOrderNotFoundException } from 'modules/sell-orders/exceptions';
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
      const createQueryBuilder: any = {
        where: () => createQueryBuilder,
        andWhere: () => createQueryBuilder,
        getOne: () => undefined,
      };
      jest.spyOn(SellOrder, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);

      try {
        await service.getOne('1' as unknown as SellOrderIdDto);
      } catch (error) {
        expect(error).toBeInstanceOf(SellOrderNotFoundException);
      }
    });

    test('should return sellorder', async () => {
      const createQueryBuilder: any = {
        where: () => createQueryBuilder,
        andWhere: () => createQueryBuilder,
        getOne: () => 'sellorder',
      };
      jest.spyOn(SellOrder, 'createQueryBuilder').mockImplementation(() => createQueryBuilder);
      const sellorder = await service.getOne('1' as unknown as SellOrderIdDto);
      expect(sellorder).toBe('sellorder');
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
