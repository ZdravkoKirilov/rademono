import * as e from 'fp-ts/lib/Either';
import { get, omit } from 'lodash/fp';

import { transformToClass } from '../parsers';
import { breakTest } from '../test';
import { ParsingError, StringOfLength, UUIDv4 } from '../types';
import {
  PrivateAdminGroup,
  AdminGroupId,
  CreateAdminGroupDto,
} from './AdminGroup';
import { PrivateAdminProfile } from './AdminProfile';

describe('AdminGroup entity', () => {
  describe(PrivateAdminGroup.name, () => {
    describe(PrivateAdminGroup.create, () => {
      it('passes with enough data', (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Admins',
        } as CreateAdminGroupDto;

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

      it('breaks with too long description', (done) => {
        const publicId = UUIDv4.generate<AdminGroupId>();
        const createId = () => publicId;

        const data = {
          name: 'Name',
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

        const profile = PrivateAdminProfile.createFromDto(
          {
            name: StringOfLength.generate<1, 100>('John Doe'),
            user: UUIDv4.generate(),
            group: UUIDv4.generate(),
          },
          UUIDv4.generate,
        );

        const data = {
          name: 'Admins',
          public_id: publicId,
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

    describe(PrivateAdminGroup.createFromDto.name, () => {
      it('creates an AdminGroup', (done) => {
        const id = UUIDv4.generate<AdminGroupId>();

        const data = transformToClass(CreateAdminGroupDto, {
          name: 'Name',
          description: 'Desc',
        });

        const result = PrivateAdminGroup.createFromDto(data, () => id);
        expect(result).toBeInstanceOf(PrivateAdminGroup);
        expect(result).toEqual({
          ...data,
          public_id: id,
          profiles: [],
        });
        done();
      });
    });

    describe(PrivateAdminGroup.addProfile.name, () => {
      it('adds new profile', (done) => {
        const id = UUIDv4.generate<AdminGroupId>();

        const groupData = transformToClass(CreateAdminGroupDto, {
          name: 'Name',
          description: 'Desc',
        });

        const profileData = transformToClass(PrivateAdminProfile, {
          name: 'George',
          user: UUIDv4.generate(),
          group: UUIDv4.generate(),
        });

        const group = PrivateAdminGroup.createFromDto(groupData, () => id);
        const profile = PrivateAdminProfile.createFromDto(
          profileData,
          UUIDv4.generate,
        );

        const withProfile = PrivateAdminGroup.addProfile(group, profile);

        expect(withProfile).toBeInstanceOf(PrivateAdminGroup);
        expect(withProfile).toEqual({
          ...group,
          profiles: [profile],
        });
        done();
      });
    });

    describe(PrivateAdminGroup.toPublicEntity.name, () => {
      it('transforms data', (done) => {
        const data = transformToClass(PrivateAdminGroup, {
          public_id: UUIDv4.generate(),
          name: 'Name',
          description: 'Desc',
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
