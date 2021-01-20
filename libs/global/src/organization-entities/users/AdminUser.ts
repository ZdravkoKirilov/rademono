import {
  IsDate,
  IsEmail,
  IsIn,
  IsJWT,
  IsOptional,
  IsUUID,
} from 'class-validator';
import add from 'date-fns/add';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as o from 'fp-ts/lib/Option';

import { parseAndValidateObject, parseAndValidateUnknown } from '../../parsers';
import { Email, NanoId, Tagged, UUIDv4, JWT } from '../../types';

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
  loginCode: NanoId;

  @IsOptional()
  @IsDate()
  loginCodeExpiration: Date;

  @IsOptional()
  @IsDate()
  lastLogin: Date;
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

  generateCode: (entity: FullAdminUser, now: Date): FullAdminUser => {
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
};
