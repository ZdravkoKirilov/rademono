import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@app/shared';

import { AdminProfileController } from './admin-profile.controller';
import {
  AdminProfileDBModel,
  AdminProfileRepository,
} from './admin-profile.repository';
import { AdminProfileService } from './admin-profile.service';

@Module({
  providers: [AdminProfileRepository, AdminProfileService],
  imports: [TypeOrmModule.forFeature([AdminProfileDBModel]), SharedModule],
  controllers: [AdminProfileController],
  exports: [AdminProfileRepository, AdminProfileService],
})
export class AdminProfileModule {}
