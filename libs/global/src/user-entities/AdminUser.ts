import {
  IsDate,
  IsEmail,
  IsIn,
  IsJWT,
  IsOptional,
  IsUUID,
} from 'class-validator';
import add from 'date-fns/add';
import isAfter from 'date-fns/isAfter';
import { map, switchMap } from 'rxjs/operators';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';
import { Observable } from 'rxjs';

import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  toLeftObs,
  transformToClass,
} from '../parsers';
import {
  Email,
  NanoId,
  Tagged,
  UUIDv4,
  JWT,
  ParsingError,
  InvalidJWT,
} from '../types';
import { Expose } from 'class-transformer';

export type AdminUserId = Tagged<'AdminUserId', UUIDv4>;

export enum AdminUserTypes {
  superuser = 'superuser',
  standard = 'standard',
}

export class AdminUser {
  id: AdminUserId;
  email: Email;
  type: AdminUserTypes;
}

export class PrivateAdminUser {
  @Expose()
  @IsUUID('4')
  public_id: AdminUserId;

  @Expose()
  @IsEmail()
  email: Email;

  @Expose()
  @IsIn(Object.values(AdminUserTypes))
  type: AdminUserTypes;

  @Expose()
  @IsOptional()
  @NanoId.IsNanoId()
  loginCode?: NanoId;

  @Expose()
  @IsOptional()
  @IsDate()
  loginCodeExpiration?: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  lastLogin?: Date;
}

export class SendCodeDto {
  @Expose()
  @IsEmail()
  email: Email;
}

export class SignInDto {
  @Expose()
  @NanoId.IsNanoId()
  code: NanoId;
}

export class TokenDto {
  @Expose()
  @IsJWT()
  token: JWT;
}

export const AdminUserParser = {
  toSendCodeDto: (payload: unknown) =>
    parseAndValidateUnknown(payload, SendCodeDto),

  toSignInDto: (payload: unknown) =>
    parseAndValidateUnknown(payload, SignInDto),

  create: (
    payload: SendCodeDto,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateAdminUser>> => {
    return parseAndValidateObject(payload, SendCodeDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: PrivateAdminUser = {
            ...result.right,
            public_id: createId(),
            type: AdminUserTypes.standard,
          };

          return e.right(transformToClass(PrivateAdminUser, plain));
        }
        return result;
      }),
    );
  },

  exposePublic: (from: PrivateAdminUser): AdminUser => ({
    id: from.public_id,
    type: from.type,
    email: from.email,
  }),

  toPrivateEntity: (data: unknown) =>
    parseAndValidateUnknown(data, PrivateAdminUser),

  addLoginCode: (
    entity: PrivateAdminUser,
    now = new Date(),
    createCode: () => NanoId = NanoId.generate,
  ): PrivateAdminUser => {
    const code = createCode();
    const expiration = add(now, { minutes: 30 });

    return {
      ...entity,
      loginCode: code,
      loginCodeExpiration: expiration,
    };
  },

  verifyLoginCode: (entity: PrivateAdminUser, now = new Date()) => {
    const expires = entity.loginCodeExpiration;
    return expires ? isAfter(expires, now) : false;
  },

  generateToken: (
    entity: PrivateAdminUser,
    createToken = JWT.generate,
  ): Observable<e.Either<ParsingError, TokenDto>> => {
    return parseAndValidateObject(
      {
        token: createToken({ email: entity.email }),
      },
      TokenDto,
    );
  },

  decodeToken: (token: unknown) => {
    return parseAndValidateObject({ token }, TokenDto).pipe(
      switchMap((mbToken) => {
        if (e.isLeft(mbToken)) {
          return toLeftObs(new InvalidJWT('Invalid token'));
        }
        return JWT.verify(mbToken.right.token).pipe(
          map((mbDecoded) => {
            if (o.isNone(mbDecoded)) {
              return e.left(new InvalidJWT('Invalid token'));
            }
            return e.right(mbDecoded.value);
          }),
        );
      }),
    );
  },

  verifyToken: (
    token: JWT,
    entity: PrivateAdminUser,
    verify = JWT.verify,
  ): Observable<boolean> => {
    return verify(token, 'secret').pipe(
      map((result) => {
        if (o.isNone(result)) {
          return false;
        }
        return result.value.email === entity.email ? true : false;
      }),
    );
  },

  signIn: (entity: PrivateAdminUser, now = new Date()): PrivateAdminUser => {
    return {
      ...omit(['loginCode', 'loginCodeExpiration'], entity),
      lastLogin: now,
    };
  },
};
