import {
  AdminUserParser,
  MalformedPayloadError,
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
} from '@end/global';
import { Injectable } from '@nestjs/common';
import { from, Observable } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import { AdminUserRepository } from './admin-users.repository';

@Injectable()
export class AdminUsersService {
  constructor(private readonly repo: AdminUserRepository) {}

  requestLoginCode(
    payload: unknown,
  ): Observable<
    e.Either<ParsingError | MalformedPayloadError | UnexpectedError, undefined>
  > {
    return from(AdminUserParser.toSendCodeDto(payload)).pipe(
      switchMap((dto) => {
        if (e.isLeft(dto)) {
          return toLeftObs(dto.left);
        }
        return this.repo.findUser({ email: dto.right.email }).pipe(
          switchMap((maybeUser) => {
            if (e.isLeft(maybeUser)) {
              return toLeftObs(maybeUser.left);
            }

            if (o.isNone(maybeUser.right)) {
              return AdminUserParser.create(dto.right);
            }

            return toRightObs(maybeUser.right.value);
          }),
        );
      }),
      switchMap((mbUser) => {
        if (e.isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        const userWithLoginToken = AdminUserParser.addLoginCode(mbUser.right);

        return this.repo.saveUser(userWithLoginToken).pipe(
          tap(() => {
            // send email
          }),
          map(() => e.right(undefined)),
        );
      }),
      catchError(() => toLeftObs(new UnexpectedError())),
    );
  }

  create(payload: unknown) {
    return 'This action adds a new adminUser';
  }

  findAll() {
    return `This action returns all adminUsers`;
  }

  findOne(id: number) {
    return `This action returns a #${id} adminUser`;
  }

  update(id: number, payload: unknown) {
    return `This action updates a #${id} adminUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} adminUser`;
  }
}
