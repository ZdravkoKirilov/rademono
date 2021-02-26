import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { CollectionId, PrivateCollection } from './Collection';

describe('Collection entity', () => {
  describe(PrivateCollection.name, () => {
    describe(PrivateCollection.create.name, () => {
      it('passes with enough data', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          name: 'Name',
          description: 'Desc',
          parent: UUIDv4.generate(),
          admin_group: UUIDv4.generate(),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({
            ...data,
            public_id,
          });
          done();
        });
      });

      it('fails when the name is missing', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          parent: UUIDv4.generate(),
          admin_group: UUIDv4.generate(),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails when the name is too long', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          parent: UUIDv4.generate(),
          admin_group: UUIDv4.generate(),
          name: new Array(102).fill('a'),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails when the description is too long', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          parent: UUIDv4.generate(),
          admin_group: UUIDv4.generate(),
          name: 'Name',
          description: new Array(1001).fill('abcde'),
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('description');
          done();
        });
      });

      it('fails when parent is invalid', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          parent: 'invalid',
          admin_group: UUIDv4.generate(),
          name: 'Name',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('parent');
          done();
        });
      });

      it('fails when admin_group is missing', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          parent: UUIDv4.generate(),
          name: 'Name',
          description: 'desc',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('admin_group');
          done();
        });
      });

      it('fails when admin_group is invalid', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          admin_group: 'Invalid',
          name: 'Name',
          description: 'desc',
          organization: UUIDv4.generate(),
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('admin_group');
          done();
        });
      });

      it('fails when organization is missing', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          admin_group: UUIDv4.generate(),
          name: 'Name',
          description: 'desc',
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('organization');
          done();
        });
      });

      it('fails when organization is invalid', (done) => {
        const public_id = UUIDv4.generate<CollectionId>();
        const createId = () => public_id;

        const data = {
          admin_group: UUIDv4.generate(),
          name: 'Name',
          description: 'desc',
          organization: 'Invalid',
        };

        PrivateCollection.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('organization');
          done();
        });
      });
    });

    describe(PrivateCollection.toPrivateEntity.name, () => {
      it('works with enough data', (done) => {
        const data = {
          public_id: UUIDv4.generate(),
          name: 'Name',
          admin_group: UUIDv4.generate(),
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
          admin_group: UUIDv4.generate(),
          parent: UUIDv4.generate(),
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
          admin_group: UUIDv4.generate(),
          parent: UUIDv4.generate(),
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
          parent: UUIDv4.generate(),
          admin_group: UUIDv4.generate(),
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
