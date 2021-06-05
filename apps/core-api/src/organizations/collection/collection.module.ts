import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';
import { SharedModule } from '@app/shared';
import { AdminUsersModule } from '@app/users/admin-users';

import { COLLECTION_DB } from './constants';
import { CollectionRepository } from './collection.repository';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

@Module({
  providers: [CollectionRepository, CollectionService],
  controllers: [CollectionController],
  imports: [
    DatabaseModule.forFeature(COLLECTION_DB),
    SharedModule,
    AdminUsersModule,
  ],
})
export class CollectionModule {}
