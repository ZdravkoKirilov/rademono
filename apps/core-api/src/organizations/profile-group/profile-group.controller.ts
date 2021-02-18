import { Controller, Post, Body } from '@nestjs/common';

import { ProfileGroupService } from './profile-group.service';

@Controller('profile-group')
export class ProfileGroupController {
  constructor(private readonly profileGroupService: ProfileGroupService) {}

  @Post()
  create(@Body() payload: unknown) {
    return this.profileGroupService.create(payload);
  }
}
