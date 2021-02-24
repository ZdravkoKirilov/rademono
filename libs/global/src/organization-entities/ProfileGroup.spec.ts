import * as e from 'fp-ts/lib/Either';

import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { PrivateProfileGroup, ProfileGroupId } from './ProfileGroup';

describe('ProfileGroup entity', () => {
  describe(PrivateProfileGroup.name, () => {
    describe(PrivateProfileGroup.create, () => {
      it('passes with enough data', (done) => {
        const publicId = UUIDv4.generate<ProfileGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Admins',
          organization: UUIDv4.generate(),
        };

        PrivateProfileGroup.create(data, createId).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({
            ...data,
            public_id: publicId,
          });
          done();
        });
      });

      it('breaks without a name', (done) => {
        const publicId = UUIDv4.generate<ProfileGroupId>();
        const createId = () => publicId;

        const data = {
          organization: UUIDv4.generate(),
        };

        PrivateProfileGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('breaks without an organization', (done) => {
        const publicId = UUIDv4.generate<ProfileGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Name',
        };

        PrivateProfileGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('organization');
          done();
        });
      });

      it('breaks with too long description', (done) => {
        const publicId = UUIDv4.generate<ProfileGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Name',
          organization: UUIDv4.generate(),
          description: new Array(5002).fill('g'),
        };

        PrivateProfileGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('description');
          done();
        });
      });

      it('breaks with too long name', (done) => {
        const publicId = UUIDv4.generate<ProfileGroupId>();
        const createId = () => publicId;

        const data = {
          name: new Array(102).fill('k'),
          organization: UUIDv4.generate(),
          description: 'bla bla bla',
        };

        PrivateProfileGroup.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });
    });

    describe(PrivateProfileGroup.toPrivateEntity.name, () => {
      it('passes with enough data', (done) => {
        const data = {
          name: 'Name',
          public_id: UUIDv4.generate(),
          organization: UUIDv4.generate(),
          description: 'Desc',
        };

        PrivateProfileGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('breaks without a public_id', (done) => {
        const data = {
          name: 'Name',
          organization: UUIDv4.generate(),
          description: 'Desc',
        };

        PrivateProfileGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('public_id');
          done();
        });
      });

      it('breaks with an invalid public_id', (done) => {
        const data = {
          name: 'Name',
          organization: UUIDv4.generate(),
          description: 'Desc',
          public_id: 'not a uuid',
        };

        PrivateProfileGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('public_id');
          done();
        });
      });
    });
  });
});
