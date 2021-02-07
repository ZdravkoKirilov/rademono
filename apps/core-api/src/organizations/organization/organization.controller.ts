import { Controller, Post, Body } from '@nestjs/common';

import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.organizationService.create(payload);
  }
}
