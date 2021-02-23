import { PUBLIC_ID_GENERATOR } from '@app/shared';
import { UUIDv4 } from '@end/global';
import { Test, TestingModule } from '@nestjs/testing';

import { AdminProfileService } from '../admin-profile';
import { ProfileGroupService } from '../profile-group';

import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {},
        },
        {
          provide: ProfileGroupService,
          useValue: {},
        },
        { provide: AdminProfileService, useValue: {} },
        { provide: PUBLIC_ID_GENERATOR, useValue: UUIDv4.generate },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
