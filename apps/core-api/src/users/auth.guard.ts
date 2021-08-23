import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

import {
  DecodedJWT,
  isLeft,
  User,
  toLeftObs,
  Option,
  Either,
  isNone,
  Observable,
  switchMap,
  map,
  catchError,
} from '@end/global';
import { isKnownError, toUnauthorizedError } from '@app/shared';

import { UserRepository } from './users.repository';

export type RequestWithUser = Request & { user: User };

const forbid = () => {
  throw toUnauthorizedError({
    name: 'Unauthorized',
    message: 'Unauthorized to view this resource',
  });
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private repo: UserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const authToken = request.header('Authorization');

    if (!authToken) {
      forbid();
    }

    const result = await User.toTokenDto({ token: authToken })
      .pipe(
        switchMap(
          (mbDto): Observable<Either<unknown, DecodedJWT>> => {
            if (isLeft(mbDto)) {
              return toLeftObs(false);
            }

            return User.decodeToken(mbDto.right.token, jwt.verify);
          },
        ),
        switchMap(
          (mbDecoded): Observable<Either<unknown, Option<User>>> => {
            if (isLeft(mbDecoded)) {
              return toLeftObs(false);
            }
            return this.repo.findUser({ email: mbDecoded.right.email });
          },
        ),
        map((mbUser) => {
          if (isLeft(mbUser)) {
            return forbid();
          }
          if (isNone(mbUser.right)) {
            return forbid();
          }
          request.user = mbUser.right.value;

          return true;
        }),
        catchError((err) => {
          if (isKnownError(err)) {
            return forbid();
          }
          throw err;
        }),
      )
      .toPromise();

    return !!result;
  }
}
