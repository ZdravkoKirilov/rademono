import * as e from 'fp-ts/lib/Either';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, UUIDv4 } from '../types';
import { OrganizationId, PrivateOrganization } from './Organization';
import { ProfileGroupId } from './ProfileGroup';

describe('Organization entity', () => {
  describe(PrivateOrganization.name, () => {
    describe(PrivateOrganization.create.name, () => {
      it('passes with enough data', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const payload = { name: 'Name' };
        PrivateOrganization.create(payload, createId).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual({
            ...payload,
            public_id: id,
          });
          done();
        });
      });

      it('fails if the "name" field is missing', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const payload = { description: 'whatever' };

        PrivateOrganization.create(payload, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails if the "name" field is too long', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const payload = {
          description: 'whatever',
          name: new Array(102).join('a'),
        };

        PrivateOrganization.create(payload, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails if the "description" field is too long', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const payload = {
          description: new Array(5002).join('a'),
          name: 'whatever',
        };

        PrivateOrganization.create(payload, createId).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors[0].property).toBe('description');
          done();
        });
      });
    });

    describe(PrivateOrganization.setAdminGroup.name, () => {
      it('adds the admin group', () => {
        const entity = transformToClass(PrivateOrganization, { name: 'Name' });
        const groupId = UUIDv4.generate<ProfileGroupId>();
        const result = PrivateOrganization.setAdminGroup(entity, groupId);
        expect(result).toEqual({
          name: 'Name',
          admin_group: groupId,
        });
      });
    });

    describe(PrivateOrganization.toPrivateEntity.name, () => {
      it('passes with enough data', (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = UUIDv4.generate();

        const data = {
          name: 'name',
          public_id,
          admin_group,
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('fails when the public_id is missing', (done) => {
        const admin_group = UUIDv4.generate();

        const data = {
          name: 'name',
          admin_group,
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('public_id');
          done();
        });
      });

      it('fails when the admin_group is missing', (done) => {
        const public_id = UUIDv4.generate();

        const data = {
          name: 'name',
          public_id,
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('admin_group');
          done();
        });
      });

      it('fails when the "name" is too long', (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = UUIDv4.generate();

        const data = {
          name: new Array(102).join('b'),
          public_id,
          admin_group,
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('name');
          done();
        });
      });

      it('fails when the "description" is too long', (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = UUIDv4.generate();

        const data = {
          name: 'Name',
          description: new Array(5002).join('c'),
          public_id,
          admin_group,
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isRight(res)) {
            return breakTest();
          }
          expect(res.left).toBeInstanceOf(ParsingError);
          expect(res.left.errors.length).toBe(1);
          expect(res.left.errors[0].property).toBe('description');
          done();
        });
      });
    });
  });
});
