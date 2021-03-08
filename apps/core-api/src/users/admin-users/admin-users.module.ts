import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import {
  AdminUserDBModel,
  AdminUserRepository,
} from './admin-users.repository';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserRepository],
  imports: [TypeOrmModule.forFeature([AdminUserDBModel])],
  exports: [AdminUserRepository],
})
export class AdminUsersModule {}
