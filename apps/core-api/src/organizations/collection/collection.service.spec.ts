import { PUBLIC_ID_GENERATOR } from '@app/shared';
import {
  breakTest,
  CollectionId,
  OrganizationId,
  ParsingError,
  PrivateCollection,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  UUIDv4,
} from '@end/global';
import { Test, TestingModule } from '@nestjs/testing';
import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';

import { CollectionRepository } from './collection.repository';
import { CollectionService } from './collection.service';

describe(CollectionService.name, () => {
  let service: CollectionService;

  describe(CollectionService.prototype.create.name, () => {
    const collectionId = UUIDv4.generate<any>();
    const organizationId = UUIDv4.generate<OrganizationId>();

    it('passes with enough data', async (done) => {
      const data = PrivateCollection.createFromDto(
        {
          name: 'Name',
          description: 'Some desc',
        },
        collectionId,
        organizationId,
      );

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          CollectionService,
          {
            provide: CollectionRepository,
            useValue: {
              createCollection: (data: unknown) => toRightObs(data),
            } as Partial<CollectionRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => collectionId },
        ],
      }).compile();

      service = module.get<CollectionService>(CollectionService);

      service.create(data, organizationId).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }

        expect(res.right).toEqual({
          ...omit('public_id', data),
          id: collectionId,
        });

        done();
      });
    });

    it('fails when the repo fails', async (done) => {
      const data = PrivateCollection.createFromDto(
        {
          name: 'Name',
          description: 'Some desc',
        },
        collectionId,
        organizationId,
      );

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          CollectionService,
          {
            provide: CollectionRepository,
            useValue: {
              createCollection: () => toLeftObs(new UnexpectedError()),
            } as Partial<CollectionRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => collectionId },
        ],
      }).compile();

      service = module.get<CollectionService>(CollectionService);

      service.create(data, organizationId).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(UnexpectedError);

        done();
      });
    });

    it('fails when the parsing fails', async (done) => {
      const data = {};

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          CollectionService,
          {
            provide: CollectionRepository,
            useValue: {
              createCollection: () => {
                return breakTest();
              },
            } as Partial<CollectionRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => collectionId },
        ],
      }).compile();

      service = module.get<CollectionService>(CollectionService);

      service.create(data, organizationId).subscribe((res) => {
        if (e.isRight(res)) {
          return breakTest();
        }
        expect(res.left).toBeInstanceOf(ParsingError);

        done();
      });
    });
  });

  describe(CollectionService.prototype.getAll.name, () => {
    it('returns all collections as public entities', async (done) => {
      const organizationId = UUIDv4.generate<OrganizationId>();

      const collection1 = PrivateCollection.createFromDto(
        {
          name: 'Collection1',
          description: 'Some desc',
        },
        UUIDv4.generate<CollectionId>(),
        organizationId,
      );

      const collection2 = PrivateCollection.createFromDto(
        {
          name: 'Collection2',
          description: 'Some desc',
        },
        UUIDv4.generate<CollectionId>(),
        organizationId,
      );

      const module: TestingModule = await Test.createTestingModule({
        imports: [],
        providers: [
          CollectionService,
          {
            provide: CollectionRepository,
            useValue: {
              getCollections: () => toRightObs([collection1, collection2]),
            } as Partial<CollectionRepository>,
          },
          { provide: PUBLIC_ID_GENERATOR, useValue: () => 1 },
        ],
      }).compile();

      service = module.get<CollectionService>(CollectionService);

      service.getAll(organizationId).subscribe((res) => {
        if (e.isLeft(res)) {
          return breakTest();
        }

        expect(res.right).toHaveLength(2);

        expect(res.right[0]).toEqual({
          ...omit('public_id', collection1),
          id: collection1.public_id,
        });

        expect(res.right[1]).toEqual({
          ...omit('public_id', collection2),
          id: collection2.public_id,
        });

        done();
      });
    });
  });
});
