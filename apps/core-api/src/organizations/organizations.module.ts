import { Module } from '@nestjs/common';

import { OrganizationModule } from './organization/organization.module';
import { ProfileGroupModule } from './profile-group/profile-group.module';
import { AdminProfileModule } from './admin-profile/admin-profile.module';
import { CollectionModule } from './collection/collection.module';

@Module({
  imports: [
    OrganizationModule,
    ProfileGroupModule,
    AdminProfileModule,
    CollectionModule,
  ],
})
export class OrganizationsModule {}
