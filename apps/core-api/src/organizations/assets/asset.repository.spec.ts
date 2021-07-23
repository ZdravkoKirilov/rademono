import { Test, TestingModule } from '@nestjs/testing';
import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';

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
  AssetId,
  DomainError,
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
        if (E.isLeft(res)) {
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
        if (E.isRight(res)) {
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
        if (E.isLeft(res)) {
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
        if (E.isLeft(res)) {
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
        if (E.isRight(res)) {
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
        if (E.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(AssetRepository.prototype.getSingleAsset.name, () => {
    const organizationId = UUIDv4.generate<OrganizationId>();

    it('returns the asset', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate<AssetId>(),
        type: AssetType.image,
        url: 'www.images.com/image.png',
        organization: organizationId,
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service.getSingleAsset({ public_id: data.public_id }).subscribe((res) => {
        if (E.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(O.some(data));
        done();
      });
    });

    it('returns no asset', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toRightObs(undefined),
      });

      service
        .getSingleAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(O.none);
          done();
        });
    });

    it('fails when the db adaptor fails', async (done) => {
      const { service } = await createTestingModule({
        findOne: () => toLeftObs(new UnexpectedError('whatever')),
      });

      service
        .getSingleAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });

    it('fails when the entity is corrupted', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate<AssetId>(),
        type: 'invalid type',
        url: 'www.images.com/image.png',
        organization: organizationId,
      };

      const { service } = await createTestingModule({
        findOne: () => toRightObs(data),
      });

      service
        .getSingleAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          done();
        });
    });
  });

  describe(AssetRepository.prototype.deleteAsset.name, () => {
    const organizationId = UUIDv4.generate<OrganizationId>();

    it('deletes the asset', async (done) => {
      const data = {
        name: 'Name',
        public_id: UUIDv4.generate<AssetId>(),
        type: AssetType.image,
        url: 'www.images.com/image.png',
        organization: organizationId,
      };

      const { service } = await createTestingModule({
        deleteOne: () => toRightObs(1),
        count: () => toRightObs(1),
      });

      service.deleteAsset({ public_id: data.public_id }).subscribe((res) => {
        if (E.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toBeUndefined();
        done();
      });
    });

    it('fails when the asset is not found', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(0),
      });

      service
        .deleteAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(DomainError);
          done();
        });
    });

    it('fails when multiple assets are found', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(2),
      });

      service
        .deleteAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });

    it('fails when the asset cannot be found', async (done) => {
      const { service } = await createTestingModule({
        count: () => toLeftObs(new UnexpectedError('whatever')),
      });

      service
        .deleteAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });

    it('fails when the asset cannot be deleted', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(1),
        deleteOne: () => toLeftObs(new UnexpectedError('whatever')),
      });

      service
        .deleteAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });

    it('fails when 0 assets are deleted', async (done) => {
      const { service } = await createTestingModule({
        count: () => toRightObs(1),
        deleteOne: () => toRightObs(0),
      });

      service
        .deleteAsset({ public_id: UUIDv4.generate<AssetId>() })
        .subscribe((res) => {
          if (E.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(UnexpectedError);
          done();
        });
    });
  });
});
