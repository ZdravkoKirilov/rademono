import * as e from 'fp-ts/lib/Either';
import { get, omit } from 'lodash/fp';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { PrivateAdminGroup, AdminGroupId } from './AdminGroup';
import { PrivateAdminProfile } from './AdminProfile';

describe('AdminGroup entity', () => {
  describe(PrivateAdminGroup.name, () => {
    describe(PrivateAdminGroup.create, () => {
      it('passes with enough data', (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Admins',
          organization: UUIDv4.generate(),
        };

        PrivateAdminGroup.create(data, createId).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({
            ...data,
            public_id: publicId,
            profiles: [],
          });
          done();
        });
      });

      it('breaks without a name', (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          organization: UUIDv4.generate(),
          profiles: [],
        };

        PrivateAdminGroup.create(data, createId).subscribe((res) => {
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
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Name',
        };

        PrivateAdminGroup.create(data, createId).subscribe((res) => {
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
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Name',
          organization: UUIDv4.generate(),
          description: new Array(5002).fill('g'),
        };

        PrivateAdminGroup.create(data, createId).subscribe((res) => {
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
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: new Array(102).fill('k'),
          organization: UUIDv4.generate(),
          description: 'bla bla bla',
        };

        PrivateAdminGroup.create(data, createId).subscribe((res) => {
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

    describe(PrivateAdminGroup.toPrivateEntity.name, () => {
      it('passes with enough data', (done) => {
        const data = {
          name: 'Name',
          public_id: UUIDv4.generate(),
          organization: UUIDv4.generate(),
          description: 'Desc',
        };

        PrivateAdminGroup.toPrivateEntity(data).subscribe((res) => {
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

        PrivateAdminGroup.toPrivateEntity(data).subscribe((res) => {
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

        PrivateAdminGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('public_id');
          done();
        });
      });

      it('passes with nested profiles', async (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();

        const profile = await PrivateAdminProfile.create(
          {
            name: 'John Doe',
            user: UUIDv4.generate(),
            group: UUIDv4.generate(),
          },
          UUIDv4.generate,
        ).toPromise();

        const data = {
          name: 'Admins',
          public_id: publicId,
          organization: UUIDv4.generate(),
          profiles: [get('right', profile)],
        };

        PrivateAdminGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({
            ...data,
            description: undefined,
            public_id: publicId,
            profiles: [get('right', profile)],
          });
          done();
        });
      });

      it('fails with invalid profile', async (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();

        const data = {
          name: 'Admins',
          organization: UUIDv4.generate(),
          profiles: [{}],
          public_id: publicId,
        };

        PrivateAdminGroup.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left.errors).toHaveLength(1);
          expect(res.left.errors[0].property).toBe('profiles');
          done();
        });
      });
    });

    describe(PrivateAdminGroup.toPublicEntity.name, () => {
      it('transforms data', (done) => {
        const data = transformToClass(PrivateAdminGroup, {
          public_id: UUIDv4.generate(),
          name: 'Name',
          description: 'Desc',
          organization: UUIDv4.generate(),
          profiles: [],
        });

        const result = PrivateAdminGroup.toPublicEntity(data);
        expect(result).toEqual({
          ...omit('public_id', data),
          id: data.public_id,
        });
        done();
      });
    });
  });
});
