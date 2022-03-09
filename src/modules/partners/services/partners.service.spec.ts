import { Test, TestingModule } from '@nestjs/testing';
import { PartnersService } from './partners.service';

describe('PartnersService', () => {
  let partnersService: PartnersService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      imports: [],
      providers: [PartnersService],
    }).compile();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    partnersService = app.get<PartnersService>(PartnersService);
  });

  describe('findOne', () => {
    it('should return a partner for the given UUID', async () => {
      //TODO: Implement
    });
  });
});
