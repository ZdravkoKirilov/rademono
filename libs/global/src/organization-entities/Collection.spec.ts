import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { CollectionId, PrivateCollection } from './Collection';
import { OrganizationId } from './Organization';

describe('Collection entity', () => {
  describe(PrivateCollection.name, () => {
    describe(PrivateCollection.create.name, () => {
      const organizationId = UUIDv4.generate<OrganizationId>();

      it('passes with enough data', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          name: 'Name',
          description: 'Desc',
        };

        PrivateCollection.create(data, createId, organizationId).subscribe(
          (res) => {
            if (e.isLeft(res)) {
              return breakTest();
            }
            expect(res.right).toEqual({
              ...data,
              public_id,
              organization: organizationId,
            });
            done();
          },
        );
      });

      it('fails when the name is missing', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId, organizationId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors).toHaveLength(1);
            expect(res.left.errors[0].property).toBe('name');
            done();
          },
        );
      });

      it('fails when the name is too long', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          name: new Array(102).fill('a'),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId, organizationId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors).toHaveLength(1);
            expect(res.left.errors[0].property).toBe('name');
            done();
          },
        );
      });

      it('fails when the description is too long', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          name: 'Name',
          description: new Array(1001).fill('abcde'),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId, organizationId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors).toHaveLength(1);
            expect(res.left.errors[0].property).toBe('description');
            done();
          },
        );
      });
    });

    describe(PrivateCollection.toPrivateEntity.name, () => {
      it('works with enough data', (done) => {
        const data = {
          public_id: UUIDv4.generate(),
          name: 'Name',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('works with optional data', (done) => {
        const data = {
          public_id: UUIDv4.generate(),
          name: 'Name',
          description: 'Desc',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('omits unknown fields', (done) => {
        const data = {
          public_id: UUIDv4.generate(),
          name: 'Name',
          description: 'Desc',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.toPrivateEntity({
          ...data,
          unknownField: 5,
        }).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });
    });

    describe(PrivateCollection.toPublicEntity.name, () => {
      it('transforms data', (done) => {
        const data = transformToClass(PrivateCollection, {
          public_id: UUIDv4.generate(),
          name: 'Name',
          description: 'Desc',
          organization: UUIDv4.generate(),
        });

        const result = PrivateCollection.toPublicEntity(data);

        expect(result).toEqual({
          ...omit('public_id', data),
          id: data.public_id,
        });
        done();
      });
    });
  });
});
