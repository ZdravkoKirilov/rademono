import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import {
  OrganizationDBModel,
  OrganizationRepository,
} from './organization.repository';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  imports: [TypeOrmModule.forFeature([OrganizationDBModel])],
})
export class OrganizationModule {}
