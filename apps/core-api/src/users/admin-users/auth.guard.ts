import { DecodedJWT, PrivateAdminUser, toLeftObs } from '@end/global';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';
import jwt from 'jsonwebtoken';

import { AdminUserRepository } from './admin-users.repository';
import { isKnownError, toUnauthorizedError } from '@app/shared';

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
          (mbDto): Observable<e.Either<unknown, DecodedJWT>> => {
            if (e.isLeft(mbDto)) {
              return toLeftObs(false);
            }

            return PrivateAdminUser.decodeToken(mbDto.right.token, jwt.verify);
          },
        ),
        switchMap(
          (
            mbDecoded,
          ): Observable<e.Either<unknown, o.Option<PrivateAdminUser>>> => {
            if (e.isLeft(mbDecoded)) {
              return toLeftObs(false);
            }
            return this.repo.findUser({ email: mbDecoded.right.email });
          },
        ),
        map((mbUser) => {
          if (e.isLeft(mbUser)) {
            return forbid();
          }
          if (o.isNone(mbUser.right)) {
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

    return result;
  }
}
