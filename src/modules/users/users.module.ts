import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { AuthModule } from '../../modules/auth/auth.module';
import { UserTransformer } from './transformers/user.transformer';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([User])],
  providers: [UsersService, UserTransformer],
  controllers: [UsersController],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
