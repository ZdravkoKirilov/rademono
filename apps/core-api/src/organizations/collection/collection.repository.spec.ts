import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import { get, omit } from 'lodash/fp';
import {
  UUIDv4,
  breakTest,
  UnexpectedError,
  toRightObs,
  toLeftObs,
  PrivateCollection,
  ParsingError,
} from '@end/global';

import { DbentityService } from '@app/database';
import {
  CollectionDBModel,
  CollectionRepository,
} from './collection.repository';

const createTestingModule = async (
  repoMock: Partial<DbentityService<CollectionDBModel>> = {},
) => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [],
    providers: [
      {
        provide: DbentityService,
        useValue: repoMock,
      },
      CollectionRepository,
    ],
  }).compile();

  const service = module.get<CollectionRepository>(CollectionRepository);

  return { service };
};

describe(CollectionRepository.name, () => {
  describe(CollectionRepository.prototype.createCollection.name, () => {
    it('succeeds with enough data', async (done) => {
      const data = PrivateCollection.createFromDto({
        name: 'Name',
      });

      const { service } = await createTestingModule({
        insert: (data) => toRightObs(data),
      });

      service.createCollection(data).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual(data);
        done();
      });
    });

    it('handles repo errors', async (done) => {
      const { service } = await createTestingModule({
        insert: () => toLeftObs(new UnexpectedError()),
      });

      const data = PrivateCollection.createFromDto({
        name: 'Name',
      });

      service.createCollection(data).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });
  });

  describe(CollectionRepository.prototype.getCollections.name, () => {
    it('returns all organizations', async (done) => {
      const collection1 = PrivateCollection.createFromDto({
        name: 'Collection 1',
      });

      const collection2 = PrivateCollection.createFromDto({
        name: 'Collection 2',
      });

      const { service } = await createTestingModule({
        findAll: () => toRightObs([collection1, collection2]),
      });

      service.getCollections(UUIDv4.generate()).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual([collection1, collection2]);
        done();
      });
    });

    it('returns 0 organizations', async (done) => {
      const { service } = await createTestingModule({
        findAll: () => toRightObs([]),
      });

      service.getCollections(UUIDv4.generate()).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }
        expect(res.right).toEqual([]);
        done();
      });
    });

    it('catches unexpected errors', async (done) => {
      const { service } = await createTestingModule({
        findAll: () => toLeftObs(new UnexpectedError()),
      });

      service.getCollections(UUIDv4.generate()).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);
        done();
      });
    });

    it('catches parsing errors', async (done) => {
      const collection1 = PrivateCollection.createFromDto({
        name: 'Collection 1',
      });

      const collection2 = PrivateCollection.createFromDto({
        name: 'Collection 2',
      });

      const invalidCollection2 = omit('name', collection2);

      const { service } = await createTestingModule({
        findAll: () => toRightObs([collection1, invalidCollection2 as any]),
      });

      service.getCollections(UUIDv4.generate()).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);
        expect(get('errors', res.left)).toHaveLength(1);
        done();
      });
    });
  });
});
