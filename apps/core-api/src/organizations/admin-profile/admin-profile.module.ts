import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';

import { AdminProfileController } from './admin-profile.controller';
import { AdminProfileRepository } from './admin-profile.repository';
import { AdminProfileService } from './admin-profile.service';
import { DatabaseModule } from '@app/database';
import { ADMINPROFILE_COLLECTION } from './constants';

@Module({
  providers: [AdminProfileRepository, AdminProfileService],
  imports: [SharedModule, DatabaseModule.forFeature(ADMINPROFILE_COLLECTION)],
  controllers: [AdminProfileController],
  exports: [AdminProfileRepository, AdminProfileService],
})
export class AdminProfileModule {}
