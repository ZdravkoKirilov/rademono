import {
  IsDate,
  IsEmail,
  IsIn,
  IsJWT,
  IsOptional,
  IsUUID,
} from 'class-validator';
import add from 'date-fns/add';
import { map } from 'rxjs/operators';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';
import { Observable } from 'rxjs';

import {
  parseAndValidateObject,
  parseAndValidateUnknown,
  transformToClass,
} from '../../parsers';
import { Email, NanoId, Tagged, UUIDv4, JWT, ParsingError } from '../../types';

type AdminUserId = Tagged<'AdminUserId', UUIDv4>;

enum AdminUserTypes {
  superuser = 'superuser',
  standard = 'standard',
}

export class AdminUser {
  @IsUUID()
  id: AdminUserId;

  @IsEmail()
  email: Email;

  @IsIn(Object.values(AdminUserTypes))
  type: AdminUserTypes;
}

export class FullAdminUser extends AdminUser {
  @IsOptional()
  @NanoId.IsNanoId()
  loginCode?: NanoId;

  @IsOptional()
  @IsDate()
  loginCodeExpiration?: Date;

  @IsOptional()
  @IsDate()
  lastLogin?: Date;
}

class SendCodeDto {
  @IsEmail()
  email: Email;
}

class SignInDto {
  @NanoId.IsNanoId()
  code: NanoId;
}

class ReturnTokenDto {
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
  ): Observable<e.Either<ParsingError, AdminUser>> => {
    return parseAndValidateObject(payload, SendCodeDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: AdminUser = {
            ...result.right,
            id: createId(),
            type: AdminUserTypes.standard,
          };

          return e.right(transformToClass(AdminUser, plain));
        }
        return result;
      }),
    );
  },

  toFullEntity: (data: unknown) => parseAndValidateUnknown(data, FullAdminUser),

  addLoginCode: (entity: FullAdminUser, now = new Date()): FullAdminUser => {
    const code = NanoId.generate();
    const expiration = add(now, { minutes: 30 });

    return {
      ...entity,
      loginCode: code,
      loginCodeExpiration: expiration,
    };
  },

  generateToken: (entity: FullAdminUser) => {
    return parseAndValidateObject(
      {
        token: JWT.generate({ email: entity.email }, 'peshoelud'),
      },
      ReturnTokenDto,
    );
  },

  verifyToken: (token: JWT, entity: FullAdminUser) => {
    return JWT.verify(token, 'peshoelud').pipe(
      map((result) => {
        if (o.isNone(result)) {
          return false;
        }
        return result.value.email === entity.email ? true : false;
      }),
    );
  },

  signIn: (entity: FullAdminUser, now = new Date()): FullAdminUser => {
    return {
      ...omit(['loginCode', 'loginCodeExpiration'], entity),
      lastLogin: now,
    };
  },
};
