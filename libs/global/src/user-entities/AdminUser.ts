import {
  IsDate,
  IsEmail,
  IsIn,
  IsJWT,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';
import add from 'date-fns/add';
import isAfter from 'date-fns/isAfter';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { omit } from 'lodash/fp';
import { Observable, of } from 'rxjs';
import { Expose } from 'class-transformer';

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
  DomainError,
  DecodedJWT,
  Dictionary,
} from '../types';

export type AdminUserId = Tagged<'AdminUserId', UUIDv4>;

export enum AdminUserTypes {
  superuser = 'superuser',
  standard = 'standard',
}

export class AdminUser {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  id: AdminUserId;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: Email;

  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(AdminUserTypes))
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

  static toSendCodeDto(payload: unknown) {
    return parseAndValidateUnknown(payload, SendCodeDto);
  }

  static toSignInDto(payload: unknown) {
    return parseAndValidateUnknown(payload, SignInDto);
  }

  static toTokenDto(payload: unknown) {
    return parseAndValidateUnknown(payload, TokenDto);
  }

  static create(
    payload: SendCodeDto,
    createId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, PrivateAdminUser>> {
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
  }

  static exposePublic(from: PrivateAdminUser): AdminUser {
    return {
      id: from.public_id,
      type: from.type,
      email: from.email,
    };
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, PrivateAdminUser);
  }

  static addLoginCode(
    entity: PrivateAdminUser,
    now = new Date(),
    createCode: () => NanoId = NanoId.generate,
  ): PrivateAdminUser {
    const code = createCode();
    const expiration = add(now, { minutes: 30 });

    return {
      ...entity,
      loginCode: code,
      loginCodeExpiration: expiration,
    };
  }

  static verifyLoginCode(entity: PrivateAdminUser, now = new Date()) {
    const expires = entity.loginCodeExpiration;
    return expires ? isAfter(expires, now) : false;
  }

  static generateToken(
    entity: PrivateAdminUser,
    generate: (
      data: Dictionary,
      secret: string,
      options: { expiresIn: string },
    ) => string,
    options: { expiresIn: string } = { expiresIn: '24h' },
    secret = 'secret',
  ): Observable<e.Either<ParsingError, TokenDto>> {
    return parseAndValidateObject(
      {
        token: generate({ email: entity.email }, secret, options),
      },
      TokenDto,
    );
  }

  static decodeToken(
    token: unknown,
    // eslint-disable-next-line @typescript-eslint/ban-types
    decode: (token: string, secret: string) => string | object,
    secret = 'secret',
  ): Observable<e.Either<DomainError | ParsingError, DecodedJWT>> {
    return parseAndValidateObject({ token }, TokenDto).pipe(
      switchMap((mbToken) => {
        if (e.isLeft(mbToken)) {
          return toLeftObs(new DomainError('Invalid jwt token'));
        }
        try {
          return of(decode(mbToken.right.token, secret)).pipe(
            switchMap((res) => parseAndValidateUnknown(res, DecodedJWT)),
            catchError((err) => {
              return toLeftObs(new DomainError('Invalid jwt token', [err]));
            }),
          );
        } catch (err) {
          return toLeftObs(new DomainError('Invalid jwt token', [err]));
        }
      }),
    );
  }

  static signIn(entity: PrivateAdminUser, now = new Date()): PrivateAdminUser {
    return {
      ...entity,
      loginCode: undefined,
      loginCodeExpiration: undefined,
      lastLogin: now,
    };
  }
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
