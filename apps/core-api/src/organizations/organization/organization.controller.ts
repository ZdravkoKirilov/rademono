import { PrivateAdminUser } from '@end/global';
import { Controller, Post, Body } from '@nestjs/common';

import { WithUser } from '../../users/admin-users';

import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() payload: unknown, @WithUser() user: PrivateAdminUser) {
    return this.organizationService.create(payload, user.public_id);
  }
}
