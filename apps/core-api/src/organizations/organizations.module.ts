import { Module } from '@nestjs/common';

import { OrganizationModule } from './organization/organization.module';
import { ProfileGroupModule } from './profile-group/profile-group.module';
import { AdminProfileModule } from './admin-profile/admin-profile.module';
import { CollectionModule } from './collection/collection.module';
import { AssetsModule } from './assets/assets.module';

@Module({
  imports: [
    OrganizationModule,
    ProfileGroupModule,
    AdminProfileModule,
    CollectionModule,
    AssetsModule,
  ],
})
export class OrganizationsModule {}
