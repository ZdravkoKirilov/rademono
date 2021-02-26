import * as e from 'fp-ts/lib/Either';
import { get } from 'lodash/fp';
import { add, sub } from 'date-fns';

import { Email, JWT, NanoId, ParsingError, UUIDv4 } from '../types';
import {
  AdminUserId,
  AdminUserTypes,
  PrivateAdminUser,
  TokenDto,
  SendCodeDto,
  SignInDto,
} from './AdminUser';

const throwError = () => {
  throw new Error('Unexpected');
};

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

  describe(PrivateAdminUser.generateToken.name, () => {
    it('produces a token', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload: PrivateAdminUser = {
        email: Email.generate('email@gmail.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
      };

      const token = JWT.generate({ email: payload.email });
      const createToken = () => token;

      PrivateAdminUser.generateToken(payload, createToken).subscribe(
        (value) => {
          if (e.isLeft(value)) {
            return throwError();
          }

          expect(value.right).toBeInstanceOf(TokenDto);
          expect(value.right).toEqual({ token });
          done();
        },
      );
    });

    it('fails if the produced token is invalid', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload: PrivateAdminUser = {
        email: Email.generate('this is not an email'),
        type: AdminUserTypes.standard,
        public_id: publicId,
      };

      const token = 'not a token' as JWT;
      const createToken = () => token;

      PrivateAdminUser.generateToken(payload, createToken).subscribe(
        (value) => {
          if (e.isRight(value)) {
            return throwError();
          }

          expect(value.left).toBeInstanceOf(ParsingError);
          expect(value.left.errors[0].property).toEqual('token');
          done();
        },
      );
    });
  });

  describe(PrivateAdminUser.verifyToken.name, () => {
    it('passes with a valid token', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload: PrivateAdminUser = {
        email: Email.generate('email@email.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
      };

      const tokenData = { email: payload.email };
      const token = JWT.generate(tokenData);

      PrivateAdminUser.verifyToken(token, payload).subscribe((response) => {
        expect(response).toBe(true);
        done();
      });
    });

    it('fails with invalid token', (done) => {
      const publicId = UUIDv4.generate<AdminUserId>();

      const payload: PrivateAdminUser = {
        email: Email.generate('email@email.com'),
        type: AdminUserTypes.standard,
        public_id: publicId,
      };

      const token = 'invalidToken' as JWT;

      PrivateAdminUser.verifyToken(token, payload).subscribe((response) => {
        expect(response).toBe(false);
        done();
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

  describe(PrivateAdminUser.decodeToken.name, () => {
    it('passes with valid token', (done) => {
      const tokenData = {
        email: Email.generate('email@email.com'),
      };

      const token = JWT.generate(tokenData);

      PrivateAdminUser.decodeToken(token).subscribe((result) => {
        if (e.isLeft(result)) {
          return throwError();
        }
        expect(result.right).toEqual(tokenData);
        done();
      });
    });

    it('fails with undefined token', (done) => {
      PrivateAdminUser.decodeToken(undefined as any).subscribe((result) => {
        if (e.isRight(result)) {
          return throwError();
        }
        expect(e.isLeft(result)).toBe(true);
        done();
      });
    });

    it('fails with expired token', (done) => {
      const token = JWT.generate(
        {
          email: Email.generate('email@email.com'),
          exp: sub(new Date(), { hours: 1 }).getTime() / 1000,
        },
        {},
        'secret',
      );

      PrivateAdminUser.decodeToken(token).subscribe((result) => {
        if (e.isRight(result)) {
          return throwError();
        }
        expect(e.isLeft(result)).toBe(true);
        done();
      });
    });
  });
});
