import * as e from 'fp-ts/lib/Either';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { AdminProfileId, PrivateAdminProfile } from './AdminProfile';

describe('AdminProfile entity', () => {
  describe(PrivateAdminProfile.name, () => {
    describe(PrivateAdminProfile.create.name, () => {
      it('passes with enough data', (done) => {
        const data = {
          name: 'Name',
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
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

      it('fails if "Name" is missing', (done) => {
        const data = {
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails if "Name" is too long', (done) => {
        const data = {
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
          name: new Array(102).fill('l'),
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails if "group" is missing', (done) => {
        const data = {
          user: UUIDv4.generate(),
          name: 'Name',
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('group');
          done();
        });
      });

      it('fails if "group" is invalid id', (done) => {
        const data = {
          user: UUIDv4.generate(),
          name: 'Name',
          group: 'not a uuid',
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('group');
          done();
        });
      });

      it('fails if "user" is missing', (done) => {
        const data = {
          group: UUIDv4.generate(),
          name: 'Name',
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('user');
          done();
        });
      });

      it('fails if "user" is not a valid id', (done) => {
        const data = {
          group: UUIDv4.generate(),
          name: 'Name',
          user: 'invalid uuid',
        };

        const public_id = UUIDv4.generate<AdminProfileId>();
        const createId = () => public_id;

        PrivateAdminProfile.create(data, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('user');
          done();
        });
      });
    });

    describe(PrivateAdminProfile.toPrivateEntity, () => {
      it('passes with enough data', (done) => {
        const data = {
          public_id: UUIDv4.generate(),
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
          name: 'Admins',
        };

        PrivateAdminProfile.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('fails without a public_id', (done) => {
        const data = {
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
          name: 'Admins',
        };

        PrivateAdminProfile.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('public_id');
          done();
        });
      });

      it('fails with invalid public_id', (done) => {
        const data = {
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
          name: 'Admins',
          public_id: 'Invalid id',
        };

        PrivateAdminProfile.toPrivateEntity(data).subscribe((res) => {
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

    describe(PrivateAdminProfile.toPublicEntity.name, () => {
      it('transforms the data', () => {
        const data = {
          public_id: UUIDv4.generate(),
          name: 'Name',
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
        };
        expect(
          PrivateAdminProfile.toPublicEntity(
            transformToClass(PrivateAdminProfile, data),
          ),
        ).toEqual({
          id: data.public_id,
          name: data.name,
          user: data.user,
          group: data.group,
        });
      });
    });
  });
});
