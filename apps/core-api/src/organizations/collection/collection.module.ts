import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/database';

import { COLLECTION_DB } from './constants';
import { CollectionRepository } from './collection.repository';

@Module({
  providers: [CollectionRepository],
  imports: [DatabaseModule.forFeature(COLLECTION_DB)],
})
export class CollectionModule {}
