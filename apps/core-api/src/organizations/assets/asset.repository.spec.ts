import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import {
  UUIDv4,
  breakTest,
  UnexpectedError,
  ParsingError,
  toRightObs,
  toLeftObs,
  PrivateAsset,
  OrganizationId,
  AssetType,
} from '@end/global';
import { AssetRepository } from './asset.repository';
import { DbentityService } from '@app/database';

const createTestingModule = async (
  repoMock: Partial<DbentityService<any>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: DbentityService,
        useValue: repoMock,
      },
      AssetRepository,
    ],
  }).compile();

  const service = module.get<AssetRepository>(AssetRepository);

  return { service };
};

describe(AssetRepository.name, () => {
  describe(AssetRepository.prototype.createAsset.name, () => {
    it('saves an asset', async (done) => {
      const data = {
        name: 'Name',
      } as PrivateAsset;

      const { service } = await createTestingModule({
        insert: () => toRightObs(1),
      });

      service.createAsset(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        insert: () => toLeftObs(new UnexpectedError('')),
      });

      const data = {
        name: 'Name',
      } as PrivateAsset;

      service.createAsset(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(AssetRepository.prototype.getAssets.name, () => {
    const organizationId = UUIDv4.generate<OrganizationId>();

    it('returns all assets', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate(),
        type: AssetType.image,
        url: 'www.images.com/image.png',
        organization: organizationId,
      };

      const { service } = await createTestingModule({
        findAll: () => toRightObs([data]),
      });

      service.getAssets(organizationId).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual([data]);
        done();
      });
    });

    it('returns no assets', async (done) => {
      const { service } = await createTestingModule({
        findAll: () => toRightObs([]),
      });

      service.getAssets(organizationId).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual([]);
        done();
      });
    });

    it('handles unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        findAll: () => toLeftObs(new UnexpectedError('')),
      });

      service.getAssets(organizationId).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('handles parsing errors', async (done) => {
      const data = {
        name: 'Name',
      };

      const { service } = await createTestingModule({
        findAll: () => toRightObs([data]),
      });

      service.getAssets(organizationId).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });
});
