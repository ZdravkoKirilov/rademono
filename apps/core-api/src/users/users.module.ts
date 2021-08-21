import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { EmailsModule } from '@app/emails';

import { AdminUsersService } from './admin-users.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUserRepository } from './admin-users.repository';
import { ADMIN_USERS_COLLECTION } from './constants';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminUserRepository],
  imports: [DatabaseModule.forFeature(ADMIN_USERS_COLLECTION), EmailsModule],
  exports: [AdminUserRepository],
})
export class UsersModule {}
