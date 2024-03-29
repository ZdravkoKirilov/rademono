import { Test, TestingModule } from '@nestjs/testing';

import { PUBLIC_ID_GENERATOR } from '@app/shared';
import {
  UserId,
  breakTest,
  DomainError,
  isLeft,
  isRight,
  ParsingError,
  PrivateAdminGroup,
  StringOfLength,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { OrganizationRepository } from './organization.repository';
import { OrganizationService } from './organization.service';

describe(OrganizationService.name, () => {
  let service: OrganizationService;

  describe(OrganizationService.prototype.create.name, () => {
    it('passes with enough data', async (done) => {
      const data = {
        name: 'Name',
      };

      const public_id = UUIDv4.generate();
      const userId = UUIDv4.generate<UserId>();

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
          { provide: PUBLIC_ID_GENERATOR, useValue: () => public_id },
        ],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);

      service.create(data, userId).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual({
          name: data.name,
          id: public_id,
          admin_group: {
            id: public_id,
            name: 'Admins',
            profiles: [
              { id: public_id, name: 'Admin', group: public_id, user: userId },
            ],
          },
        });

        done();
      });
    });

    it('fails when the name is missing', async (done) => {
      const data = {};

      const public_id = UUIDv4.generate();
      const userId = UUIDv4.generate<UserId>();

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          OrganizationService,
          {
            provide: OrganizationRepository,
            useValue: {},
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => public_id },
        ],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);

      service.create(data, userId).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);

        done();
      });
    });

    it('fails when the name is taken', async (done) => {
      const data = {
        name: 'Name',
      };

      const public_id = UUIDv4.generate();
      const userId = UUIDv4.generate<UserId>();

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          OrganizationService,
          {
            provide: OrganizationRepository,
            useValue: {
              organizationExists: () => toRightObs(true),
            },
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => public_id },
        ],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);

      service.create(data, userId).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(DomainError);

        done();
      });
    });

    it('fails when repo.create fails', async (done) => {
      const data = {
        name: 'Name',
      };

      const public_id = UUIDv4.generate();
      const userId = UUIDv4.generate<UserId>();

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          OrganizationService,
          {
            provide: OrganizationRepository,
            useValue: {
              organizationExists: () => toRightObs(false),
              createOrganization: () => toLeftObs(new UnexpectedError()),
            },
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => public_id },
        ],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);

      service.create(data, userId).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);

        done();
      });
    });
  });

  describe(OrganizationService.prototype.getAllForUser.name, () => {
    it('returns all organizations', async (done) => {
      const userId = UUIDv4.generate<UserId>();

      const adminGroup = PrivateAdminGroup.createFromDto(
        {
          name: StringOfLength.generate<1, 100>('The doors'),
        },
        UUIDv4.generate,
      );

      const organizations = [
        { name: 'One', admin_group: adminGroup },
        { name: 'Two', admin_group: adminGroup },
      ];

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          OrganizationService,
          {
            provide: OrganizationRepository,
            useValue: {
              getOrganizations: () => toRightObs(organizations),
            },
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: UUIDv4.generate },
        ],
      }).compile();

      service = module.get<OrganizationService>(OrganizationService);

      service.getAllForUser(userId).subscribe((result) => {
        if (isLeft(result)) {
          return breakTest();
        }
        expect(result.right).toHaveLength(2);
        done();
      });
    });
  });
});
