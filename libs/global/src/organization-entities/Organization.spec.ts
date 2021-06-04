import * as e from 'fp-ts/lib/Either';
import { AdminUserId } from 'src/user-entities';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, StringOfLength, UUIDv4 } from '../types';
import { PrivateAdminGroup } from './AdminGroup';
import {
  CreateOrganizationDto,
  Organization,
  OrganizationId,
  PrivateOrganization,
} from './Organization';

describe('Organization entity', () => {
  describe(PrivateOrganization.name, () => {
    const adminGroup = PrivateAdminGroup.createFromDto(
      {
        name: 'The doors' as StringOfLength<1, 100>,
      },
      UUIDv4.generate,
    );

    describe(PrivateOrganization.create.name, () => {
      it('passes with enough data', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const userId = UUIDv4.generate<AdminUserId>();

        const payload = { name: 'Name' };

        PrivateOrganization.create(payload, createId, userId).subscribe(
          (res) => {
            if (e.isLeft(res)) {
              return breakTest();
            }
            expect(res.right).toEqual({
              ...payload,
              public_id: id,
              admin_group: {
                name: 'Admins',
                public_id: id,
                profiles: [
                  {
                    group: id,
                    name: 'Admin',
                    public_id: id,
                    user: userId,
                  },
                ],
              },
            });
            done();
          },
        );
      });

      it('fails if the "name" field is missing', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const userId = UUIDv4.generate<AdminUserId>();

        const payload = { description: 'whatever' };

        PrivateOrganization.create(payload, createId, userId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors[0].property).toBe('name');
            done();
          },
        );
      });

      it('fails if the "name" field is too long', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const createId = () => id;
        const userId = UUIDv4.generate<AdminUserId>();

        const payload = {
          description: 'whatever',
          name: new Array(102).join('a'),
        };

        PrivateOrganization.create(payload, createId, userId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors[0].property).toBe('name');
            done();
          },
        );
      });

      it('fails if the "description" field is too long', (done) => {
        const id = UUIDv4.generate<OrganizationId>();
        const userId = UUIDv4.generate<AdminUserId>();

        const createId = () => id;
        const payload = {
          description: new Array(5002).join('a'),
          name: 'whatever',
        };

        PrivateOrganization.create(payload, createId, userId).subscribe(
          (res) => {
            if (e.isRight(res)) {
              return breakTest();
            }
            expect(res.left).toBeInstanceOf(ParsingError);
            expect(res.left.errors[0].property).toBe('description');
            done();
          },
        );
      });
    });

    describe(PrivateOrganization.toPrivateEntity.name, () => {
      it('passes with enough data', async (done) => {
        const public_id = UUIDv4.generate();

        const data = {
          name: 'name',
          public_id,
          admin_group: adminGroup,
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
        const data = {
          name: 'name',
          admin_group: adminGroup,
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

        const data = {
          name: new Array(102).join('b'),
          public_id,
          admin_group: adminGroup,
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

        const data = {
          name: 'Name',
          description: new Array(5002).join('c'),
          public_id,
          admin_group: adminGroup,
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

  describe(Organization.name, () => {
    describe(Organization.create.name, () => {
      it('passes with enough data', (done) => {
        const data = { name: 'Name' };

        Organization.create(data).subscribe((result) => {
          if (e.isLeft(result)) {
            return breakTest();
          }
          expect(result.right).toBeInstanceOf(CreateOrganizationDto);
          expect(result.right).toEqual(data);
          done();
        });
      });
    });
  });
});
