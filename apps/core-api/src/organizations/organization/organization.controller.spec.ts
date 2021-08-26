import { Test, TestingModule } from '@nestjs/testing';

import {
  DomainError,
  ParsingError,
  User,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { KnownErrors } from '@app/shared';

import { AuthGuard } from '../../users';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

describe(OrganizationController.name, () => {
  let controller: OrganizationController;

  describe(OrganizationController.prototype.create.name, () => {
    it('passes when OrganizationService.create passes', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const data = {
        name: 'Monster inc',
      };

      const result = { name: 'Organization' };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              create: () => toRightObs(result),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      controller.create(data, user).subscribe((res) => {
        expect(res).toEqual(result);
        done();
      });
    });

    it('fails when OrganizationService.create randomly throws', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const data = {
        name: 'Monster inc',
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              create: () => {
                throw new UnexpectedError('oops');
              },
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.create(data, user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        expect(err.message).toBe('Unexpected error');
        expect(err.response.originalError.message).toBe('oops');
        done();
      }
    });

    it('fails when OrganizationService.create returns an UnexpectedError', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const data = {
        name: 'Monster inc',
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              create: () => toLeftObs(new UnexpectedError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.create(data, user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        expect(err.message).toBe('oops');
        done();
      }
    });

    it('fails when OrganizationService.create returns a DomainError', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const data = {
        name: 'Monster inc',
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              create: () => toLeftObs(new DomainError('UnexpectedError')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.create(data, user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.ForbiddenException);
        expect(err.message).toBe('UnexpectedError');
        done();
      }
    });

    it('fails when OrganizationService.create returns a ParsingError', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const data = {
        name: 'Monster inc',
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              create: () => toLeftObs(new ParsingError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.create(data, user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.BadRequestException);
        expect(err.message).toBe('oops');
        done();
      }
    });
  });

  describe(OrganizationController.prototype.getAllForUser.name, () => {
    it('passes when the service passes', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              getAllForUser: () => toRightObs([]),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      controller.getAllForUser(user).subscribe((res) => {
        expect(res).toEqual([]);
        done();
      });
    });

    it('fails when the service returns an UnexpectedError', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              getAllForUser: () => toLeftObs(new UnexpectedError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.getAllForUser(user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        done();
      }
    });

    it('fails when the service returns a ParsingError', async (done) => {
      const user = {
        public_id: UUIDv4.generate(),
      } as User;

      const module: TestingModule = await Test.createTestingModule({
        controllers: [OrganizationController],
        providers: [
          {
            provide: OrganizationService,
            useValue: {
              getAllForUser: () => toLeftObs(new ParsingError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<OrganizationController>(OrganizationController);

      try {
        await controller.getAllForUser(user).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.BadRequestException);
        expect(err.message).toBe('oops');
        done();
      }
    });
  });
});
