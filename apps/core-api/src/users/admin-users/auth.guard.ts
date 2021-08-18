import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import jwt from 'jsonwebtoken';

import {
  DecodedJWT,
  isLeft,
  PrivateAdminUser,
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

import { AdminUserRepository } from './admin-users.repository';

export type RequestWithUser = Request & { user: PrivateAdminUser };

const forbid = () => {
  throw toUnauthorizedError({
    name: 'Unauthorized',
    message: 'Unauthorized to view this resource',
  });
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private repo: AdminUserRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: RequestWithUser = context.switchToHttp().getRequest();

    const authToken = request.header('Authorization');

    if (!authToken) {
      forbid();
    }

    const result = await PrivateAdminUser.toTokenDto({ token: authToken })
      .pipe(
        switchMap(
          (mbDto): Observable<Either<unknown, DecodedJWT>> => {
            if (isLeft(mbDto)) {
              return toLeftObs(false);
            }

            return PrivateAdminUser.decodeToken(mbDto.right.token, jwt.verify);
          },
        ),
        switchMap(
          (
            mbDecoded,
          ): Observable<Either<unknown, Option<PrivateAdminUser>>> => {
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
