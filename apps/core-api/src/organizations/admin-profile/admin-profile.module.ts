import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminProfileController } from './admin-profile.controller';
import {
  AdminProfileDBModel,
  AdminProfileRepository,
} from './admin-profile.repository';
import { AdminProfileService } from './admin-profile.service';

@Module({
  providers: [AdminProfileRepository, AdminProfileService],
  imports: [TypeOrmModule.forFeature([AdminProfileDBModel])],
  controllers: [AdminProfileController],
})
export class AdminProfileModule {}
