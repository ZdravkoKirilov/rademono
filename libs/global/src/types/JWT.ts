import jwt from 'jsonwebtoken';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';
import { IsEmail } from 'class-validator';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Expose } from 'class-transformer';

import { Email } from './Email';
import { Tagged } from './Tagged';
import { parseAndValidateUnknown } from '../parsers';

export type JWT = Tagged<'__JWT__', string>;

export class DecodedJWT {
  @Expose()
  @IsEmail()
  email: Email;
}

export class InvalidJWT extends Error {}

const generate = (
  data: DecodedJWT & { exp?: number },
  signOptions: jwt.SignOptions = { expiresIn: '24h' },
  secret = 'secret',
) => jwt.sign(data, secret, signOptions) as JWT;

const verify = (
  token: JWT,
  secret = 'secret',
): Observable<o.Option<DecodedJWT>> => {
  try {
    return of(jwt.verify(token, secret)).pipe(
      switchMap((payload) => {
        return parseAndValidateUnknown(payload, DecodedJWT);
      }),
      map((result) => {
        return e.isLeft(result) ? o.none : o.some(result.right);
      }),
      catchError(() => of(o.none)),
    );
  } catch {
    return of(o.none);
  }
};

export const JWT = { generate, verify };
