import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/Either';

import { PUBLIC_ID_GENERATOR } from '@app/shared';
import {
  Asset,
  breakTest,
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
  hasFieldError,
  DomainError,
} from '@end/global';

import { AssetRepository } from './asset.repository';
import { AssetService } from './asset.service';

describe(AssetService.name, () => {
  let service: AssetService;

  const assetId = UUIDv4.generate();
  const organizationId = UUIDv4.generate();

  describe(AssetService.prototype.createImage.name, () => {
    const fileUrl = 'www.image.com/image.jpg';

    it('passes with enough data', async (done) => {
      const data = {
        name: 'some asset',
      };

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              createAsset: (data: unknown) => toRightObs(data),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service.createImage(data, organizationId, fileUrl).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }

        expect(res.right).toBeInstanceOf(Asset);
        done();
      });
    });

    it('fails when the repo fails', async (done) => {
      const data = { name: 'some asset' };

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              createAsset: () => toLeftObs(new UnexpectedError()),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service.createImage(data, organizationId, fileUrl).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);

        done();
      });
    });

    it('fails when the organizationId is invalid', async (done) => {
      const data = { name: 'some asset' };

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              createAsset: () => breakTest(),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service
        .createImage(data, 'invalid organization id', fileUrl)
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.message).toBe('Valid organizationId is required');

          done();
        });
    });

    it('fails when the file url is invalid', async (done) => {
      const data = { name: 'some asset' };

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              createAsset: () => breakTest(),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service
        .createImage(data, organizationId, 'invalid file url')
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.message).toBe('Valid asset url is required');

          done();
        });
    });

    it('fails when the main data parsing fails', async (done) => {
      const data = {};

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              createAsset: () => breakTest(),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service.createImage(data, organizationId, fileUrl).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        expect(hasFieldError(res.left, 'name')).toBe(true);

        done();
      });
    });
  });

  describe(AssetService.prototype.deleteAsset.name, () => {
    it('passes with enough data', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              deleteAsset: () => toRightObs(undefined),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service.deleteAsset(assetId, organizationId).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }

        expect(res.right).toBeUndefined();
        done();
      });
    });

    it('fails when the organization id is invalid', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              deleteAsset: () => toRightObs(undefined),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service
        .deleteAsset(assetId, 'not valid organization id')
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          done();
        });
    });

    it('fails when the asset id is invalid', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              deleteAsset: () => toRightObs(undefined),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service
        .deleteAsset('invalid asset id', organizationId)
        .subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }

          expect(res.left).toBeInstanceOf(ParsingError);
          done();
        });
    });

    it('fails when the repo fails', async (done) => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          AssetService,
          {
            provide: AssetRepository,
            useValue: {
              deleteAsset: () => toLeftObs(new DomainError('Asset not found')),
            } as Partial<AssetRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => assetId },
        ],
      }).compile();

      service = module.get<AssetService>(AssetService);

      service.deleteAsset(assetId, organizationId).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }

        expect(res.left).toBeInstanceOf(DomainError);
        expect(res.left.message).toBe('Asset not found');
        done();
      });
    });
  });
});
