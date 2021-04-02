import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { omit } from 'lodash/fp';

import {
  UUIDv4,
  breakTest,
  UnexpectedError,
  ParsingError,
  PrivateAdminProfile,
  toRightObs,
  toLeftObs,
} from '@end/global';
import { AdminProfileRepository } from './admin-profile.repository';
import { DbentityService } from '@app/database';

const createTestingModule = async (repoMock: Partial<DbentityService> = {}) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: DbentityService,
        useValue: repoMock,
      },
      AdminProfileRepository,
    ],
  }).compile();

  const service = module.get<AdminProfileRepository>(AdminProfileRepository);

  return { service };
};

describe(AdminProfileRepository.name, () => {
  describe(AdminProfileRepository.prototype.saveProfile.name, () => {
    it('succeeds with enough data', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
      } as PrivateAdminProfile;

      const { service } = await createTestingModule({
        save: () => toRightObs(1),
      });

      service.saveProfile(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        save: () => toLeftObs(new UnexpectedError('')),
      });

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
      } as PrivateAdminProfile;

      service.saveProfile(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(AdminProfileRepository.prototype.profileExists.name, () => {
    it('returns true if there is at least 1 match', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(1),
      });

      service
        .profileExists({ public_id: UUIDv4.generate() })
        .subscribe((res) => {
          if (e.isLeft(res)) {
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

      service
        .profileExists({ public_id: UUIDv4.generate() })
        .subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toBe(false);
          done();
        });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        count: () => toLeftObs(new UnexpectedError('')),
      });

      service
        .profileExists({ public_id: UUIDv4.generate() })
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });
  });

  describe(AdminProfileRepository.prototype.getProfile.name, () => {
    it('returns an admin profile', async (done) => {
      const data = {
        id: 1,
        name: 'Name',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service.getProfile({ public_id: data.public_id }).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(o.some(omit('id', data)));
        done();
      });
    });

    it('returns no admin profile', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toRightObs(undefined),
      });

      service.getProfile({ public_id: UUIDv4.generate() }).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(o.none);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toLeftObs(new UnexpectedError('')),
      });

      service.getProfile({ public_id: UUIDv4.generate() }).subscribe((res) => {
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
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data as any),
      });

      service.getProfile({ public_id: UUIDv4.generate() }).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });
});
