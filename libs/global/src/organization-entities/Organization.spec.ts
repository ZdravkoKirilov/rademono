import * as e from 'fp-ts/lib/Either';
import { get } from 'lodash/fp';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, StringOfLength, UUIDv4 } from '../types';
import { PrivateAdminGroup } from './AdminGroup';
import { OrganizationId, PrivateOrganization } from './Organization';

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
            admin_group: {
              name: 'Admins',
              organization: id,
              public_id: id,
              profiles: [],
            },
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

    describe(PrivateOrganization.toPrivateEntity.name, () => {
      it('passes with enough data', async (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = await PrivateAdminGroup.create(
          { name: 'The doors', organization: public_id },
          UUIDv4.generate,
        ).toPromise();

        const data = {
          name: 'name',
          public_id,
          admin_group: get('right', admin_group),
        };

        PrivateOrganization.toPrivateEntity(data).subscribe((res) => {
          if (e.isLeft(res)) {
            return breakTest();
          }
          expect(res.right).toEqual(data);
          done();
        });
      });

      it('fails when the public_id is missing', async (done) => {
        const admin_group = await PrivateAdminGroup.create(
          { name: 'The doors', organization: UUIDv4.generate() },
          UUIDv4.generate,
        ).toPromise();

        const data = {
          name: 'name',
          admin_group: get('right', admin_group),
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

      it('fails when the admin_group is missing', async (done) => {
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

      it('fails when the admin_group is invalid', async (done) => {
        const public_id = UUIDv4.generate();

        const data = {
          name: 'name',
          public_id,
          admin_group: 3,
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

      it('fails when the "name" is too long', async (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = await PrivateAdminGroup.create(
          { name: 'The doors', organization: UUIDv4.generate() },
          UUIDv4.generate,
        ).toPromise();

        const data = {
          name: new Array(102).join('b'),
          public_id,
          admin_group: get('right', admin_group),
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

      it('fails when the "description" is too long', async (done) => {
        const public_id = UUIDv4.generate();
        const admin_group = await PrivateAdminGroup.create(
          { name: 'The doors', organization: UUIDv4.generate() },
          UUIDv4.generate,
        ).toPromise();

        const data = {
          name: 'Name',
          description: new Array(5002).join('c'),
          public_id,
          admin_group: get('right', admin_group),
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

    describe(PrivateOrganization.toPublicEntity.name, () => {
      it('correctly transforms from private to public fields', () => {
        const adminGroup = PrivateAdminGroup.createFromDto(
          {
            name: 'The doors' as StringOfLength<1, 100>,
            organization: UUIDv4.generate(),
          },
          UUIDv4.generate,
        );

        const publicId = UUIDv4.generate();

        const data = {
          name: 'Private',
          description: 'Desc',
          admin_group: adminGroup,
          public_id: publicId,
        };

        const result = PrivateOrganization.toPublicEntity(
          transformToClass(PrivateOrganization, data),
        );

        expect(result).toEqual({
          name: 'Private',
          description: 'Desc',
          admin_group: PrivateAdminGroup.toPublicEntity(data.admin_group),
          id: publicId,
        });
      });
    });
  });
});
