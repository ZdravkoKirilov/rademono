import { Test, TestingModule } from '@nestjs/testing';

import {
  UUIDv4,
  breakTest,
  UnexpectedError,
  ParsingError,
  PrivateOrganization,
  toRightObs,
  toLeftObs,
  PrivateAdminGroup,
  OrganizationId,
  StringOfLength,
  isLeft,
  isRight,
  some,
  omit,
  none,
} from '@end/global';

import { DbentityService } from '@app/database';

import {
  OrganizationDBModel,
  OrganizationRepository,
} from './organization.repository';

const createTestingModule = async (
  repoMock: Partial<DbentityService<OrganizationDBModel>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: DbentityService,
        useValue: repoMock,
      },
      OrganizationRepository,
    ],
  }).compile();

  const service = module.get<OrganizationRepository>(OrganizationRepository);

  return { service };
};

describe(OrganizationRepository.name, () => {
  describe(OrganizationRepository.prototype.createOrganization.name, () => {
    it('succeeds with enough data', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
      } as PrivateOrganization;

      const { service } = await createTestingModule({
        insert: (data) => toRightObs(data),
      });

      service.createOrganization(data).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        insert: () => toLeftObs(new UnexpectedError()),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
      } as PrivateOrganization;

      service.createOrganization(data).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(OrganizationRepository.prototype.saveOrganization.name, () => {
    it('succeeds with enough data', async (done) => {
      const { service } = await createTestingModule({
        save: () => toRightObs(1),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        admin_group: PrivateAdminGroup.createFromDto(
          {
            name: StringOfLength.generate<1, 100>('Whatever'),
          },
          UUIDv4.generate,
        ),
      } as PrivateOrganization;

      service.saveOrganization(data).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        save: () => toLeftObs(new UnexpectedError()),
      });
      const orgId = UUIDv4.generate<OrganizationId>();

      const data = {
        name: 'Name',
        public_id: orgId,
        admin_group: PrivateAdminGroup.createFromDto(
          { name: StringOfLength.generate<1, 100>('Whatever') },
          UUIDv4.generate,
        ),
      } as PrivateOrganization;

      service.saveOrganization(data).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(OrganizationRepository.prototype.organizationExists.name, () => {
    it('returns true if there is at least 1 match', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(1),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toBe(true);
        done();
      });
    });

    it('returns false if there are 0 matches', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(0),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toBe(false);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        count: () => {
          throw new Error('oops');
        },
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        count: () => toLeftObs(new UnexpectedError()),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(OrganizationRepository.prototype.getOrganization.name, () => {
    it('returns an organization', async (done) => {
      const data = {
        id: 1,
        name: 'Name',
        public_id: UUIDv4.generate(),
        admin_group: PrivateAdminGroup.createFromDto(
          {
            name: StringOfLength.generate<1, 100>('Whatever'),
          },
          UUIDv4.generate,
        ),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(some(omit('id', data)));
        done();
      });
    });

    it('returns no organization', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toRightObs(undefined),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(none);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toLeftObs(new UnexpectedError()),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles parsing errors', async (done) => {
      const data = {
        id: 1,
        name: 'Name',
        public_id: 'Invalid',
        admin_group: PrivateAdminGroup.createFromDto(
          {
            name: StringOfLength.generate<1, 100>('Whatever'),
          },
          UUIDv4.generate,
        ),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });
});
