import { Test, TestingModule } from '@nestjs/testing';

import {
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';
import { KnownErrors } from '@app/shared';
import { AuthGuard } from '@app/users';

import { AssetService } from './asset.service';
import { AssetsController } from './assets.controller';

describe(AssetsController.name, () => {
  let controller: AssetsController;

  const fakeFile = {
    path: 'whatever',
  } as any;

  describe(AssetsController.prototype.uploadImage.name, () => {
    it(`passes when ${AssetService.name} passes`, async (done) => {
      const data = {
        name: 'Some asset',
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [AssetsController],
        providers: [
          {
            provide: AssetService,
            useValue: {
              createImage: () => toRightObs(data),
            } as Partial<AssetService>,
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<AssetsController>(AssetsController);

      controller.uploadImage(data, UUIDv4.generate(), fakeFile).then((res) => {
        expect(res).toEqual(data);
        done();
      });
    });

    it(`fails when ${AssetService.name} returns an UnexpectedError`, async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AssetsController],
        providers: [
          {
            provide: AssetService,
            useValue: {
              createImage: () => toLeftObs(new UnexpectedError('oops')),
            } as Partial<AssetService>,
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<AssetsController>(AssetsController);

      try {
        await controller.uploadImage({}, UUIDv4.generate(), fakeFile);
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        expect(err.message).toBe('oops');
        done();
      }
    });

    it(`fails when ${AssetService.name} returns a ParsingError`, async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AssetsController],
        providers: [
          {
            provide: AssetService,
            useValue: {
              createImage: () => toLeftObs(new ParsingError('oops')),
            } as Partial<AssetService>,
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<AssetsController>(AssetsController);

      try {
        await controller.uploadImage({}, UUIDv4.generate(), fakeFile);
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.BadRequestException);
        expect(err.message).toBe('oops');
        done();
      }
    });

    it(`fails with an UnexpectedError when ${AssetService.name} returns an unknown error`, async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        controllers: [AssetsController],
        providers: [
          {
            provide: AssetService,
            useValue: {
              createImage: () => toLeftObs(new Error('oops')),
            } as Partial<AssetService>,
          },
        ],
      })
        .overrideGuard(AuthGuard)
        .useValue({
          canActivate: async () => true,
        })
        .compile();

      controller = module.get<AssetsController>(AssetsController);

      try {
        await controller.uploadImage({}, UUIDv4.generate(), fakeFile);
      } catch (err) {
        expect(err).toBeInstanceOf(KnownErrors.InternalServerErrorException);
        expect(err.message).toBe('Unexpected error');
        done();
      }
    });
  });
});
