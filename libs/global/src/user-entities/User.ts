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
  UUIDv4,
  JWT,
  ParsingError,
  DomainError,
  DecodedJWT,
  Dictionary,
  Nominal,
} from '../types';

export type UserId = Nominal<UUIDv4>;

/**
 * Superusers are basically part of the product team, while standard users
 * are real clients. Superusers can help clients with setups and support
 * problems because they have access to everything.
 * Superusers can only be created via manual database update.
 */
export enum UserTypes {
  superuser = 'superuser',
  standard = 'standard',
}

export class PublicUser {
  @Expose()
  @IsNotEmpty()
  @IsUUID('4')
  id: UserId;

  @Expose()
  @IsNotEmpty()
  @IsEmail()
  email: Email;

  @Expose()
  @IsNotEmpty()
  @IsIn(Object.values(UserTypes))
  type: UserTypes;
}

export class User {
  @Expose()
  @IsUUID('4')
  public_id: UserId;

  @Expose()
  @IsEmail()
  email: Email;

  @Expose()
  @IsIn(Object.values(UserTypes))
  type: UserTypes;

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

  static createUser(
    payload: SendCodeDto,
    createId: () => UserId = UUIDv4.generate,
  ): Observable<e.Either<ParsingError, User>> {
    return parseAndValidateObject(payload, SendCodeDto).pipe(
      map((result) => {
        if (e.isRight(result)) {
          const plain: User = {
            ...result.right,
            public_id: createId(),
            type: UserTypes.standard,
          };

          return e.right(transformToClass(User, plain));
        }
        return result;
      }),
    );
  }

  static exposePublic(from: User): PublicUser {
    return {
      id: from.public_id,
      type: from.type,
      email: from.email,
    };
  }

  static toPrivateEntity(data: unknown) {
    return parseAndValidateUnknown(data, User);
  }

  static addLoginCode(
    entity: User,
    now = new Date(),
    createCode: () => NanoId = NanoId.generate,
  ): User {
    const code = createCode();
    const expiration = add(now, { minutes: 30 });

    return {
      ...entity,
      loginCode: code,
      loginCodeExpiration: expiration,
    };
  }

  static verifyLoginCode(entity: User, now = new Date()) {
    const expires = entity.loginCodeExpiration;
    return expires ? isAfter(expires, now) : false;
  }

  static generateToken(
    entity: User,
    generate: (
      data: Dictionary,
      secret: string,
      options: { expiresIn: string },
    ) => string,
    options: { expiresIn: string } = { expiresIn: '2h' },
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

  static signIn(entity: User, now = new Date()): User {
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
