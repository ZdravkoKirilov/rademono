import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import {
  InitialOrganization,
  UUIDv4,
  breakTest,
  UnexpectedError,
  ParsingError,
  PrivateOrganization,
} from '@end/global';

import {
  OrganizationDBModel,
  OrganizationRepository,
} from './organization.repository';
import { omit } from 'lodash/fp';

const createTestingModule = async (
  repoMock: Partial<Repository<OrganizationDBModel>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      OrganizationRepository,
      {
        provide: getRepositoryToken(OrganizationDBModel),
        useValue: repoMock,
      },
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
      } as InitialOrganization;

      const { service } = await createTestingModule({
        insert: () => Promise.resolve({} as any),
      });

      service.createOrganization(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        insert: () => {
          throw new Error('Whoops');
        },
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
      } as InitialOrganization;

      service.createOrganization(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        insert: () => Promise.reject(),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
      } as InitialOrganization;

      service.createOrganization(data).subscribe((res) => {
        if (e.isRight(res)) {
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
        save: () => Promise.resolve([]),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        admin_group: UUIDv4.generate(),
      } as PrivateOrganization;

      service.saveOrganization(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        save: () => {
          throw new Error('oops');
        },
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        admin_group: UUIDv4.generate(),
      } as PrivateOrganization;

      service.saveOrganization(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        save: () => Promise.reject(),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        admin_group: UUIDv4.generate(),
      } as PrivateOrganization;

      service.saveOrganization(data).subscribe((res) => {
        if (e.isRight(res)) {
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
        count: () => Promise.resolve(1),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toBe(true);
        done();
      });
    });

    it('returns false if there are 0 matches', async (done) => {
      const { service } = await createTestingModule({
        count: () => Promise.resolve(0),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (e.isLeft(res)) {
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
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        count: () => Promise.reject(),
      });

      service.organizationExists({ name: 'Whatever' }).subscribe((res) => {
        if (e.isRight(res)) {
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
        admin_group: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => Promise.resolve(data),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(o.some(omit('id', data)));
        done();
      });
    });

    it('returns no organization', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => Promise.resolve(undefined),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(o.none);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => {
          throw new Error('oops');
        },
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => Promise.reject(),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (e.isRight(res)) {
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
        admin_group: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => Promise.resolve(data),
      });

      service.getOrganization({ name: 'Name' }).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });
});
