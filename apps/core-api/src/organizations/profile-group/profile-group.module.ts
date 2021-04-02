import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { ProfileGroupController } from './profile-group.controller';
import { ProfileGroupRepository } from './profile-group.repository';
import { ProfileGroupService } from './profile-group.service';
import { DatabaseModule } from '@app/database';
import { PROFILEGROUP_COLLECTION } from './constants';

@Module({
  controllers: [ProfileGroupController],
  providers: [ProfileGroupService, ProfileGroupRepository],
  imports: [SharedModule, DatabaseModule.forFeature(PROFILEGROUP_COLLECTION)],
  exports: [ProfileGroupService, ProfileGroupRepository],
})
export class ProfileGroupModule {}
