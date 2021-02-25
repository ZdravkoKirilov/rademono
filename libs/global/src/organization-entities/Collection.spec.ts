import * as e from 'fp-ts/lib/Either';

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
    });
  });
});
