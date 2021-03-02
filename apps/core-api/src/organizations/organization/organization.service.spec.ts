import { PUBLIC_ID_GENERATOR } from '@app/shared';
import {
  AdminUserId,
  breakTest,
  toRightObs,
  UnknownRecord,
  UUIDv4,
} from '@end/global';
import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';

import { AdminProfileService } from '../admin-profile';
import { ProfileGroupService } from '../profile-group';
import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  let service: OrganizationService;

  it('passes with enough data', async (done) => {
    const data = {
      name: 'Name',
    };

    const public_id = UUIDv4.generate();
    const userId = UUIDv4.generate<AdminUserId>();
    const adminGroupId = UUIDv4.generate();
    const profileId = UUIDv4.generate();

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        OrganizationService,
        {
          provide: OrganizationRepository,
          useValue: {
            organizationExists: () => toRightObs(false),
            createOrganization: (data: unknown) => toRightObs(data),
            saveOrganization: (data: unknown) => toRightObs(data),
          },
        },
        {
          provide: ProfileGroupService,
          useValue: {
            create: (data: UnknownRecord) =>
              toRightObs({
                ...data,
                id: adminGroupId,
              }),
          },
        },
        {
          provide: AdminProfileService,
          useValue: {
            create: (data: UnknownRecord) =>
              toRightObs({
                ...data,
                id: profileId,
              }),
          },
        },
        { provide: PUBLIC_ID_GENERATOR, useValue: () => public_id },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);

    service.create(data, userId).subscribe((res) => {
      if (e.isLeft(res)) {
        return breakTest();
      }
      expect(res.right).toEqual({
        organization: {
          name: data.name,
          id: public_id,
          admin_group: adminGroupId,
        },
        group: {
          organization: public_id,
          id: adminGroupId,
          name: 'Admins',
          description: 'Admin users',
        },
        profile: {
          id: profileId,
          group: adminGroupId,
          user: userId,
          name: 'Admin',
        },
      });

      done();
    });
  });
});
