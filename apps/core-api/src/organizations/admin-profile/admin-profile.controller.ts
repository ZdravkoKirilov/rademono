import { Controller, Post, Body } from '@nestjs/common';

import { AdminProfileService } from './admin-profile.service';

@Controller('admin-profile')
export class AdminProfileController {
  constructor(private readonly adminProfileService: AdminProfileService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.adminProfileService.create(payload);
  }

  @Post('pesho')
  pesho(@Body() payload: unknown) {
    return this.adminProfileService.create(payload);
  }
}
