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
} from '@end/global';

import { AssetRepository } from './asset.repository';
import { AssetService } from './asset.service';
import { hasFieldError } from '@end/global/src/test';

describe('AssetService', () => {
  let service: AssetService;

  const assetId = UUIDv4.generate();
  const organizationId = UUIDv4.generate();
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
