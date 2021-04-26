import * as e from 'fp-ts/lib/Either';
import { get } from 'lodash/fp';
import { add, sub } from 'date-fns';

import { Email, NanoId, ParsingError, UUIDv4 } from '../types';
import {
  AdminUserId,
  AdminUserTypes,
  PrivateAdminUser,
  SendCodeDto,
  SignInDto,
} from './AdminUser';

describe(PrivateAdminUser.name, () => {
  describe(PrivateAdminUser.create.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        email: Email.generate('email@gmail.com'),
      };
      const publicId = UUIDv4.generate<AdminUserId>();
      const createId = () => publicId;

      PrivateAdminUser.create(payload, createId).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual({
          email: payload.email,
          public_id: publicId,
          type: AdminUserTypes.standard,
        });
        expect(get('right', res)).toBeInstanceOf(PrivateAdminUser);
        done();
      });
    });

    it('fails when email is invalid', (done) => {
      const payload = {
        email: Email.generate('email'),
      };
      const publicId = UUIDv4.generate<AdminUserId>();
      const createId = () => publicId;

      PrivateAdminUser.create(payload, createId).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(PrivateAdminUser.toSendCodeDto.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        email: 'email@gmail.com',
      };

      PrivateAdminUser.toSendCodeDto(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual(payload);
        expect(get('right', res)).toBeInstanceOf(SendCodeDto);
        done();
      });
    });

    it('fails with invalid email', (done) => {
      const payload = {
        email: 1,
      };

      PrivateAdminUser.toSendCodeDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails when payload is not an object', (done) => {
      const payload = null as any;

      PrivateAdminUser.toSendCodeDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(PrivateAdminUser.toSignInDto.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        code: NanoId.generate(),
      };

      PrivateAdminUser.toSignInDto(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toBeInstanceOf(SignInDto);
        expect(get('right', res)).toEqual(payload);
        done();
      });
    });

    it('fails with invalid code', (done) => {
      const payload = {
        code: 1,
      };

      PrivateAdminUser.toSignInDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails when payload is not an object', (done) => {
      const payload = null as any;

      PrivateAdminUser.toSignInDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(PrivateAdminUser.toPrivateEntity.name, () => {
    it('passes with correct data and required fields only', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual({
          email: payload.email,
          public_id: publicId,
          type: AdminUserTypes.standard,
        });
        expect(get('right', res)).toBeInstanceOf(PrivateAdminUser);
        done();
      });
    });

    it('passes with correct data and required + optional fields', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const loginCode = NanoId.generate();

      const payload: PrivateAdminUser = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual(payload);
        expect(get('right', res)).toBeInstanceOf(PrivateAdminUser);
        done();
      });
    });

    it('fails if payload is not an object', (done) => {
      const payload = null as any;

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails if email is missing', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<PrivateAdminUser> = {
        type: AdminUserTypes.standard,
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if type is missing', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<PrivateAdminUser> = {
        email: Email.generate('email@gmail.com'),
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if public_id is missing', (done) => {
      const loginCode = NanoId.generate();

      const payload: Partial<PrivateAdminUser> = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if lastLogin is invalid', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<PrivateAdminUser> = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        lastLogin: 1 as any,
        public_id: publicId,
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if loginCode is invalid', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload: Partial<PrivateAdminUser> = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        lastLogin: new Date(),
        public_id: publicId,
        loginCode: '#ghghg' as any,
        loginCodeExpiration: new Date(),
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if loginCodeExpiration is invalid', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<PrivateAdminUser> = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        lastLogin: new Date(),
        public_id: publicId,
        loginCode: loginCode,
        loginCodeExpiration: 'whaat' as any,
      };

      PrivateAdminUser.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });
  });

  describe(PrivateAdminUser.addLoginCode.name, () => {
    it('produces correct entity', () => {
      const now = new Date();
      const expiration = add(now, { minutes: 30 });
      const code = NanoId.generate();
      const createCode = () => code;

      const entity: PrivateAdminUser = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        public_id: UUIDv4.generate<AdminUserId>(),
      };

      const result = PrivateAdminUser.addLoginCode(entity, now, createCode);

      expect(result).toEqual({
        ...entity,
        loginCode: code,
        loginCodeExpiration: expiration,
      });
    });
  });

  describe(PrivateAdminUser.signIn.name, () => {
    it('modifies the user entity', () => {
      const publicId = UUIDv4.generate<AdminUserId>();
      const now = new Date();

      const payload: PrivateAdminUser = {
        email: Email.generate('email@email.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
        loginCode: NanoId.generate(),
        loginCodeExpiration: new Date(),
      };

      const result = PrivateAdminUser.signIn(payload, now);

      expect(result).toEqual({
        email: payload.email,
        type: payload.type,
        public_id: payload.public_id,
        lastLogin: now,
      });
    });
  });

  describe(PrivateAdminUser.verifyLoginCode.name, () => {
    it('passes when the login code is fresh', () => {
      const now = new Date();

      const entity: PrivateAdminUser = {
        email: Email.generate('email@email.com'),
        type: AdminUserTypes.standard,
        public_id: UUIDv4.generate<AdminUserId>(),
        loginCode: NanoId.generate(),
        loginCodeExpiration: add(now, { hours: 5 }),
      };

      const isValid = PrivateAdminUser.verifyLoginCode(entity, now);
      expect(isValid).toBe(true);
    });

    it('fails when the login code has expired', () => {
      const now = new Date();

      const entity: PrivateAdminUser = {
        email: Email.generate('email@email.com'),
        type: AdminUserTypes.standard,
        public_id: UUIDv4.generate<AdminUserId>(),
        loginCode: NanoId.generate(),
        loginCodeExpiration: sub(now, { hours: 5 }),
      };

      const isValid = PrivateAdminUser.verifyLoginCode(entity, now);
      expect(isValid).toBe(false);
    });
  });
});
