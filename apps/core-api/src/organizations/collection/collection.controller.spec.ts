import { Test, TestingModule } from '@nestjs/testing';

import {
  ParsingError,
  PrivateCollection,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';

import { KnownErrors } from '@app/shared';

import { AuthGuard } from '../../users/admin-users';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

describe(CollectionController.name, () => {
  let controller: CollectionController;

  describe(CollectionController.prototype.create.name, () => {
    it('passes when CollectionService.create passes', async (done) => {
      const data = {
        name: 'Some collection',
      };

      const collection = PrivateCollection.createFromDto(data);

      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
            useValue: {
              create: () => toRightObs(collection),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<CollectionController>(CollectionController);

      controller.create(data, UUIDv4.generate()).subscribe((res) => {
        expect(res).toEqual(collection);
        done();
      });
    });

    it('fails when CollectionService.create returns an UnexpectedError', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
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

      controller = module.get<CollectionController>(CollectionController);

      try {
        await controller.create({}, 5).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        expect(err.message).toBe('oops');
        done();
      }
    });

    it('fails when CollectionService.create returns a ParsingError', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
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

      controller = module.get<CollectionController>(CollectionController);

      try {
        await controller.create({}, 4).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.BadRequestException);
        expect(err.message).toBe('oops');
        done();
      }
    });
  });

  describe(CollectionController.prototype.getAll.name, () => {
    it('passes when the service passes', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
            useValue: {
              getAll: () => toRightObs([]),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<CollectionController>(CollectionController);

      controller.getAll(5).subscribe((res) => {
        expect(res).toEqual([]);
        done();
      });
    });

    it('fails when the service returns an UnexpectedError', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
            useValue: {
              getAll: () => toLeftObs(new UnexpectedError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<CollectionController>(CollectionController);

      try {
        await controller.getAll(3).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        done();
      }
    });

    it('fails when the service returns a ParsingError', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [CollectionController],
        providers: [
          {
            provide: CollectionService,
            useValue: {
              getAll: () => toLeftObs(new ParsingError('oops')),
            },
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<CollectionController>(CollectionController);

      try {
        await controller.getAll(4).toPromise();
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.BadRequestException);
        expect(err.message).toBe('oops');
        done();
      }
    });
  });
});
