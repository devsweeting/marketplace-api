import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PartnersController } from './controllers/partners.controller';

@Module({
    imports: [
      TypeOrmModule.forFeature([
      ]),
    ],
    providers: [
    ],
    controllers: [PartnersController],
    exports: [],
})
export class PartnersModule {}