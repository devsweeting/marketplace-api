import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from './partners.service';

describe('PartnersService', () => {
  let partnersService: PartnersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [PartnersService],
    }).compile();

    partnersService = app.get<PartnersService>(PartnersService);
  });

  describe('findOneById', () => {
    it('should return a partner for the given UUID', async () => {
      const partner = await partnersService.findOneById('123');

      expect(partner.name).toBe('PWCC');
    });
  });
});
