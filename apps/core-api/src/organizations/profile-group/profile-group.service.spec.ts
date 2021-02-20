import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import { of } from 'rxjs';
import * as o from 'fp-ts/lib/Option';

import {
  UUIDv4,
  UnexpectedError,
  toLeftObs,
  toRightObs,
  DomainError,
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
              getProfileGroup: () => of(e.right(o.none)),
              saveProfileGroup: () => of(e.right(undefined)),
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
        if (e.isLeft(dto)) {
          return throwError();
        }
        expect(dto.right).toEqual(payload);
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
              saveProfileGroup: () => of(e.right(undefined)),
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
        if (e.isRight(dto)) {
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
              getProfileGroup: () => of(e.right(o.none)),
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
        if (e.isRight(dto)) {
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
              getProfileGroup: () => toRightObs(o.some({})),
              saveProfileGroup: () => of(e.right(undefined)),
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
        if (e.isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(DomainError);
        expect(dto.left.message).toBe(
          'Profile group with that name already exists.',
        );
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
              getProfileGroup: () => of(e.right(o.none)),
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
        if (e.isRight(dto)) {
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
