import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';

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
} from '@end/global';
import { PUBLIC_ID_GENERATOR } from '@app/shared';

import { AdminProfileService } from './admin-profile.service';
import { AdminProfileRepository } from './admin-profile.repository';

const throwError = () => {
  throw new Error('This shouldn`t be reached');
};

describe('AdminProfileService', () => {
  let service: AdminProfileService;

  describe(AdminProfileService.prototype.create.name, () => {
    it('passes with correct data', async (done) => {
      const payload = {
        name: 'gosho',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminProfileService,
          {
            provide: AdminProfileRepository,
            useValue: {
              getProfile: () => of(right(none)),
              saveProfile: () => of(right(undefined)),
            } as Partial<AdminProfileRepository>,
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<AdminProfileService>(AdminProfileService);

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

    it('fails when the repo fails to get the profile', async (done) => {
      const payload = {
        name: 'gosho',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminProfileService,
          {
            provide: AdminProfileRepository,
            useValue: {
              getProfile: () =>
                toLeftObs(new UnexpectedError('Failed to find the profile')),
              saveProfile: () => of(right(undefined)),
            } as Partial<AdminProfileRepository>,
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<AdminProfileService>(AdminProfileService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe('Failed to find the profile');
        done();
      });
    });

    it('fails when the repo fails to save the profile', async (done) => {
      const payload = {
        name: 'gosho',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminProfileService,
          {
            provide: AdminProfileRepository,
            useValue: {
              getProfile: () => of(right(none)),
              saveProfile: () =>
                toLeftObs(
                  new UnexpectedError('Failed to save the admin profile'),
                ),
            } as Partial<AdminProfileRepository>,
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<AdminProfileService>(AdminProfileService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe('Failed to save the admin profile');
        done();
      });
    });

    it('fails when the profile already exists', async (done) => {
      const payload = {
        name: 'gosho',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminProfileService,
          {
            provide: AdminProfileRepository,
            useValue: {
              getProfile: () => toRightObs(some({})),
              saveProfile: () => of(right(undefined)),
            } as Partial<AdminProfileRepository>,
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<AdminProfileService>(AdminProfileService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(DomainError);
        expect(dto.left.message).toBe('Profile already exists in this group');
        done();
      });
    });

    it('fails when an error is thrown unexpectedly', async (done) => {
      const payload = {
        name: 'gosho',
        user: UUIDv4.generate(),
        group: UUIDv4.generate(),
        public_id: UUIDv4.generate(),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          AdminProfileService,
          {
            provide: AdminProfileRepository,
            useValue: {
              getProfile: () => of(right(none)),
              saveProfile: () => {
                return throwError();
              },
            } as Partial<AdminProfileRepository>,
          },
          {
            provide: PUBLIC_ID_GENERATOR,
            useValue: () => payload.public_id,
          },
        ],
      }).compile();

      service = module.get<AdminProfileService>(AdminProfileService);

      service.create(payload).subscribe((dto) => {
        if (isRight(dto)) {
          return throwError();
        }
        expect(dto.left).toBeInstanceOf(UnexpectedError);
        expect(dto.left.message).toBe(
          'Unexpected error while trying to create an admin profile',
        );
        done();
      });
    });
  });
});
