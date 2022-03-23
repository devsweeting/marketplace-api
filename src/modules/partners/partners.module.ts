import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './services/partners.service';
import { Partner, PartnerMemberUser } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, PartnerMemberUser])],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
