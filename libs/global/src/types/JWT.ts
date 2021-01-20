import jwt from 'jsonwebtoken';
import * as o from 'fp-ts/lib/Option';
import * as e from 'fp-ts/lib/Either';
import { IsEmail } from 'class-validator';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { Email } from './Email';
import { Tagged } from './Tagged';
import { parseAndValidateUnknown } from '../parsers';

export type JWT = Tagged<'__JWT__', string>;

class DecodedJWT {
  @IsEmail()
  email: Email;
}

const generate = (data: DecodedJWT, secret = 'secret') =>
  jwt.sign(data, secret, { expiresIn: '24h' }) as JWT;

const verify = (
  token: JWT,
  secret = 'secret',
): Observable<o.Option<DecodedJWT>> => {
  return of(jwt.verify(token, secret)).pipe(
    switchMap((payload) => parseAndValidateUnknown(payload, DecodedJWT)),
    map((result) => (e.isLeft(result) ? o.none : o.some(result.right))),
    catchError(() => of(o.none)),
  );
};

export const JWT = { generate, verify };
