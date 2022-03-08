import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './controllers/partners.controller';
import { PartnersService } from './services/partners.service';
import { Attribute, Partner, Asset } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([Partner, Asset, Attribute])],
  providers: [PartnersService],
  controllers: [PartnersController],
  exports: [PartnersService],
})
export class PartnersModule {}
