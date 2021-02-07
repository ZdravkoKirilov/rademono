import { Injectable } from '@nestjs/common';

@Injectable()
export class OrganizationService {
  create(createOrganizationDto: unknown) {
    return 'This action adds a new organization';
  }
}
