import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { EmailsModule } from '@app/emails';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { ADMIN_USERS_COLLECTION } from './constants';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UserRepository],
  imports: [DatabaseModule.forFeature(ADMIN_USERS_COLLECTION), EmailsModule],
  exports: [UserRepository],
})
export class UsersModule {}
