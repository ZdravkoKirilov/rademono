import * as e from 'fp-ts/lib/Either';
import { get } from 'lodash/fp';
import { add, sub } from 'date-fns';

import { Email, NanoId, ParsingError, UUIDv4 } from '../types';
import { UserId, UserTypes, User, SendCodeDto, SignInDto } from './User';

describe(User.name, () => {
  describe(User.createUser.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        email: Email.generate('email@gmail.com'),
      };
      const publicId = UUIDv4.generate<UserId>();
      const createId = () => publicId;

      User.createUser(payload, createId).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual({
          email: payload.email,
          public_id: publicId,
          type: UserTypes.standard,
        });
        expect(get('right', res)).toBeInstanceOf(User);
        done();
      });
    });

    it('fails when email is invalid', (done) => {
      const payload = {
        email: Email.generate('email'),
      };
      const publicId = UUIDv4.generate<UserId>();
      const createId = () => publicId;

      User.createUser(payload, createId).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(User.toSendCodeDto.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        email: 'email@gmail.com',
      };

      User.toSendCodeDto(payload).subscribe((res) => {
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

      User.toSendCodeDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails when payload is not an object', (done) => {
      const payload = null as any;

      User.toSendCodeDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(User.toSignInDto.name, () => {
    it('passes with correct data', (done) => {
      const payload = {
        code: NanoId.generate(),
      };

      User.toSignInDto(payload).subscribe((res) => {
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

      User.toSignInDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails when payload is not an object', (done) => {
      const payload = null as any;

      User.toSignInDto(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });
  });

  describe(User.toPrivateEntity.name, () => {
    it('passes with correct data and required fields only', (done) => {
      const publicId = UUIDv4.generate<UserId>();

      const payload = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        public_id: publicId,
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual({
          email: payload.email,
          public_id: publicId,
          type: UserTypes.standard,
        });
        expect(get('right', res)).toBeInstanceOf(User);
        done();
      });
    });

    it('passes with correct data and required + optional fields', (done) => {
      const publicId = UUIDv4.generate<UserId>();
      const loginCode = NanoId.generate();

      const payload: User = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isRight(res)).toBe(true);
        expect(get('right', res)).toEqual(payload);
        expect(get('right', res)).toBeInstanceOf(User);
        done();
      });
    });

    it('fails if payload is not an object', (done) => {
      const payload = null as any;

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        done();
      });
    });

    it('fails if email is missing', (done) => {
      const publicId = UUIDv4.generate<UserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<User> = {
        type: UserTypes.standard,
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if type is missing', (done) => {
      const publicId = UUIDv4.generate<UserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<User> = {
        email: Email.generate('email@gmail.com'),
        public_id: publicId,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if public_id is missing', (done) => {
      const loginCode = NanoId.generate();

      const payload: Partial<User> = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        lastLogin: new Date(),
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if lastLogin is invalid', (done) => {
      const publicId = UUIDv4.generate<UserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<User> = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        lastLogin: 1 as any,
        public_id: publicId,
        loginCode: loginCode,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if loginCode is invalid', (done) => {
      const publicId = UUIDv4.generate<UserId>();

      const payload: Partial<User> = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        lastLogin: new Date(),
        public_id: publicId,
        loginCode: '#ghghg' as any,
        loginCodeExpiration: new Date(),
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });

    it('fails if loginCodeExpiration is invalid', (done) => {
      const publicId = UUIDv4.generate<UserId>();
      const loginCode = NanoId.generate();

      const payload: Partial<User> = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        lastLogin: new Date(),
        public_id: publicId,
        loginCode: loginCode,
        loginCodeExpiration: 'whaat' as any,
      };

      User.toPrivateEntity(payload).subscribe((res) => {
        expect(e.isLeft(res)).toBe(true);
        expect(get('left', res)).toBeInstanceOf(ParsingError);
        expect(get('left.errors', res).length).toBe(1);
        done();
      });
    });
  });

  describe(User.addLoginCode.name, () => {
    it('produces correct entity', () => {
      const now = new Date();
      const expiration = add(now, { minutes: 30 });
      const code = NanoId.generate();
      const createCode = () => code;

      const entity: User = {
        email: Email.generate('email@gmail.com'),
        type: UserTypes.standard,
        public_id: UUIDv4.generate<UserId>(),
      };

      const result = User.addLoginCode(entity, now, createCode);

      expect(result).toEqual({
        ...entity,
        loginCode: code,
        loginCodeExpiration: expiration,
      });
    });
  });

  describe(User.signIn.name, () => {
    it('modifies the user entity', () => {
      const publicId = UUIDv4.generate<UserId>();
      const now = new Date();

      const payload: User = {
        email: Email.generate('email@email.com'),
        type: UserTypes.standard,
        public_id: publicId,
        loginCode: NanoId.generate(),
        loginCodeExpiration: new Date(),
      };

      const result = User.signIn(payload, now);

      expect(result).toEqual({
        email: payload.email,
        type: payload.type,
        public_id: payload.public_id,
        lastLogin: now,
      });
    });
  });

  describe(User.verifyLoginCode.name, () => {
    it('passes when the login code is fresh', () => {
      const now = new Date();

      const entity: User = {
        email: Email.generate('email@email.com'),
        type: UserTypes.standard,
        public_id: UUIDv4.generate<UserId>(),
        loginCode: NanoId.generate(),
        loginCodeExpiration: add(now, { hours: 5 }),
      };

      const isValid = User.verifyLoginCode(entity, now);
      expect(isValid).toBe(true);
    });

    it('fails when the login code has expired', () => {
      const now = new Date();

      const entity: User = {
        email: Email.generate('email@email.com'),
        type: UserTypes.standard,
        public_id: UUIDv4.generate<UserId>(),
        loginCode: NanoId.generate(),
        loginCodeExpiration: sub(now, { hours: 5 }),
      };

      const isValid = User.verifyLoginCode(entity, now);
      expect(isValid).toBe(false);
    });
  });
});
