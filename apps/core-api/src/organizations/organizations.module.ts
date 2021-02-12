import { Module } from '@nestjs/common';

import { OrganizationModule } from './organization/organization.module';
import { ProfileGroupModule } from './profile-group/profile-group.module';
import { AdminProfileModule } from './admin-profile/admin-profile.module';

@Module({
  imports: [OrganizationModule, ProfileGroupModule, AdminProfileModule],
})
export class OrganizationsModule {}
