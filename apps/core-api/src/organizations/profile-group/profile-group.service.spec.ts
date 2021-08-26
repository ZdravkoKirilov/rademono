import { Test, TestingModule } from '@nestjs/testing';

import {
  UUIDv4,
  UnexpectedError,
  toLeftObs,
  toRightObs,
  DomainError,
  right,
  none,
  isLeft,
  omit,
  isRight,
  some,
  of,
} from '@end/global';
import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { ProfileGroupService } from './profile-group.service';
import { ProfileGroupRepository } from './profile-group.repository';

const throwError = () => {
  throw new Error('This shouldn`t be reached');
};

const createFakeRepo = (data: {
  getProfileGroup: () => unknown;
  saveProfileGroup: () => unknown;
}) => data;

describe('ProfileGroupService', () => {
  let service: ProfileGroupService;

  describe(ProfileGroupService.prototype.create.name, () => {
    it('passes with correct data', async (done) => {
      const payload = {
        public_id: UUIDv4.generate(),
        name: 'gosho',
        organization: UUIDv4.generate(),
        description: 'this is a group',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileGroupService,
          {
            provide: ProfileGroupRepository,
            useValue: createFakeRepo({
              getProfileGroup: () => of(right(none)),
              saveProfileGroup: () => of(right(undefined)),
            }),
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<ProfileGroupService>(ProfileGroupService);

      service.create(payload).subscribe((dto) => {
        if (isLeft(dto)) {
          return throwError();
        }
        expect(dto.right).toEqual({
          ...omit('public_id', payload),
          id: payload.public_id,
        });
        done();
      });
    });

    it('fails when the repo fails to get the profile group', async (done) => {
      const payload = {
        public_id: UUIDv4.generate(),
        name: 'gosho',
        organization: UUIDv4.generate(),
        description: 'this is a group',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileGroupService,
          {
            provide: ProfileGroupRepository,
            useValue: createFakeRepo({
              getProfileGroup: () =>
                toLeftObs(
                  new UnexpectedError('Failed to find the profile group'),
                ),
              saveProfileGroup: () => of(right(undefined)),
            }),
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<ProfileGroupService>(ProfileGroupService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe('Failed to find the profile group');
        done();
      });
    });

    it('fails when the repo fails to save the profile group', async (done) => {
      const payload = {
        public_id: UUIDv4.generate(),
        name: 'gosho',
        organization: UUIDv4.generate(),
        description: 'this is a group',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileGroupService,
          {
            provide: ProfileGroupRepository,
            useValue: createFakeRepo({
              getProfileGroup: () => of(right(none)),
              saveProfileGroup: () =>
                toLeftObs(
                  new UnexpectedError('Failed to save the profile group'),
                ),
            }),
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<ProfileGroupService>(ProfileGroupService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe('Failed to save the profile group');
        done();
      });
    });

    it('fails when profile group  with the same name already exists', async (done) => {
      const payload = {
        public_id: UUIDv4.generate(),
        name: 'gosho',
        organization: UUIDv4.generate(),
        description: 'this is a group',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileGroupService,
          {
            provide: ProfileGroupRepository,
            useValue: createFakeRepo({
              getProfileGroup: () => toRightObs(some({})),
              saveProfileGroup: () => of(right(undefined)),
            }),
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<ProfileGroupService>(ProfileGroupService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(DomainError);
        expect(dto.left.message).toBe('NameTaken');
        done();
      });
    });

    it('fails when an error is thrown unexpectedly', async (done) => {
      const payload = {
        public_id: UUIDv4.generate(),
        name: 'gosho',
        organization: UUIDv4.generate(),
        description: 'this is a group',
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          ProfileGroupService,
          {
            provide: ProfileGroupRepository,
            useValue: createFakeRepo({
              getProfileGroup: () => of(right(none)),
              saveProfileGroup: () => {
                return throwError();
              },
            }),
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<ProfileGroupService>(ProfileGroupService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe(
          'Unexpected error while trying to create an admin profile group',
        );
        done();
      });
    });
  });
});
