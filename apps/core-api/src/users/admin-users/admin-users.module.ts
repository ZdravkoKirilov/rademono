import { Module } from '@nestjs/common';

import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUserRepository } from './admin-users.repository';
import { DatabaseModule } from '@app/database';
import { ADMIN_USERS_COLLECTION } from './constants';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserRepository],
  imports: [DatabaseModule.forFeature(ADMIN_USERS_COLLECTION)],
  exports: [AdminUserRepository],
})
export class AdminUsersModule {}
