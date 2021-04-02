import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import { omit } from 'lodash/fp';

import {
  UUIDv4,
  breakTest,
  UnexpectedError,
  ParsingError,
  PrivateProfileGroup,
  toRightObs,
  toLeftObs,
} from '@end/global';
import { DbentityService } from '@app/database';
import {
  ProfileGroupDBModel,
  ProfileGroupRepository,
} from './profile-group.repository';

const createTestingModule = async (
  repoMock: Partial<DbentityService<ProfileGroupDBModel>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      ProfileGroupRepository,
      {
        provide: DbentityService,
        useValue: repoMock,
      },
    ],
  }).compile();

  const service = module.get<ProfileGroupRepository>(ProfileGroupRepository);

  return { service };
};

describe(ProfileGroupRepository.name, () => {
  describe(ProfileGroupRepository.prototype.saveProfileGroup.name, () => {
    it('succeeds with enough data', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        organization: UUIDv4.generate(),
      } as PrivateProfileGroup;

      const { service } = await createTestingModule({
        save: () => toRightObs(1),
      });

      service.saveProfileGroup(data).subscribe((res) => {
        if (e.isLeft(res)) {
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

      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        organization: UUIDv4.generate(),
      } as PrivateProfileGroup;

      service.saveProfileGroup(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(ProfileGroupRepository.prototype.groupExists.name, () => {
    it('returns true if there is at least 1 match', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(1),
      });

      service
        .groupExists({ name: 'Whatever', organization: UUIDv4.generate() })
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
        .groupExists({ name: 'Whatever', organization: UUIDv4.generate() })
        .subscribe((res) => {
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

      service
        .groupExists({ name: 'Whatever', organization: '1' })
        .subscribe((res) => {
          if (e.isRight(res)) {
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

      service
        .groupExists({ name: 'Whatever', organization: '2' })
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });
  });

  describe(ProfileGroupRepository.prototype.getProfileGroup.name, () => {
    it('returns a profileGroup', async (done) => {
      const data = {
        id: 1,
        name: 'Name',
        organization: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service
        .getProfileGroup({ name: 'Name', organization: '1' })
        .subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(o.some(omit('id', data)));
          done();
        });
    });

    it('returns no profile group', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toRightObs(undefined),
      });

      service
        .getProfileGroup({ name: 'Name', organization: '1' })
        .subscribe((res) => {
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

      service
        .getProfileGroup({ name: 'Name', organization: '1' })
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toLeftObs(new UnexpectedError()),
      });

      service
        .getProfileGroup({ name: 'Name', organization: '1' })
        .subscribe((res) => {
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
        organization: UUIDv4.generate(),
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service
        .getProfileGroup({ name: 'Name', organization: '1' })
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          done();
        });
    });
  });
});
