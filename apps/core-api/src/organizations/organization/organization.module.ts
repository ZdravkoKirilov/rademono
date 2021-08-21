import { Module } from '@nestjs/common';

import { SharedModule } from '@app/shared';
import { UsersModule } from '@app/users';

import { OrganizationService } from './organization.service';
import { OrganizationController } from './organization.controller';
import { OrganizationRepository } from './organization.repository';
import { AdminProfileModule } from '../admin-profile';
import { ProfileGroupModule } from '../profile-group';
import { DatabaseModule } from '@app/database';
import { ORGANIZATIONS_COLLECTION } from './constants';

@Module({
  controllers: [OrganizationController],
  providers: [OrganizationService, OrganizationRepository],
  imports: [
    SharedModule,
    UsersModule,
    AdminProfileModule,
    ProfileGroupModule,
    DatabaseModule.forFeature(ORGANIZATIONS_COLLECTION),
  ],
})
export class OrganizationModule {}
