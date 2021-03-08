import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '@app/shared';
import { AdminUsersModule } from '@app/admin-users';

import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import {
  OrganizationDBModel,
  OrganizationRepository,
} from './organization.repository';
import { AdminProfileModule } from '../admin-profile';
import { ProfileGroupModule } from '../profile-group';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  imports: [
    TypeOrmModule.forFeature([OrganizationDBModel]),
    SharedModule,
    AdminUsersModule,
    AdminProfileModule,
    ProfileGroupModule,
  ],
})
export class OrganizationModule {}
