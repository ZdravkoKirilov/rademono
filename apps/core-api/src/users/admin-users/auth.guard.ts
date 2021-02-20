import {
  AdminUserParser,
  DecodedJWT,
  PrivateAdminUser,
  toLeftObs,
} from '@end/global';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import { AdminUserRepository } from './admin-users.repository';
import { isKnownError, toForbiddenError } from '@app/shared';

export type RequestWithUser = Request & { user: PrivateAdminUser };

const forbid = () => {
  throw toForbiddenError({
    name: 'Forbidden',
    message: 'Forbidden resource',
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

    const result = await AdminUserParser.toTokenDto({ token: authToken })
      .pipe(
        switchMap(
          (mbDto): Observable<e.Either<unknown, DecodedJWT>> => {
            if (e.isLeft(mbDto)) {
              return toLeftObs(false);
            }

            return AdminUserParser.decodeToken(mbDto.right.token);
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
