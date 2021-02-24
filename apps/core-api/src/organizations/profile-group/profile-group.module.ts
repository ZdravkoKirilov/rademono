import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@app/shared';

import { ProfileGroupController } from './profile-group.controller';
import {
  ProfileGroupDBModel,
  ProfileGroupRepository,
} from './profile-group.repository';
import { ProfileGroupService } from './profile-group.service';

@Module({
  controllers: [ProfileGroupController],
  providers: [ProfileGroupService, ProfileGroupRepository],
  imports: [TypeOrmModule.forFeature([ProfileGroupDBModel]), SharedModule],
  exports: [ProfileGroupService, ProfileGroupRepository],
})
export class ProfileGroupModule {}
