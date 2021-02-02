import {
  AdminUserParser,
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  TokenDto,
  DomainError,
} from '@end/global';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import { AdminUserRepository } from './admin-users.repository';

@Injectable()
export class AdminUsersService {
  constructor(private readonly repo: AdminUserRepository) {}

  requestAuthToken(
    payload: unknown,
  ): Observable<
    e.Either<ParsingError | UnexpectedError | DomainError, TokenDto>
  > {
    return AdminUserParser.toSignInDto(payload).pipe(
      switchMap((mbSignInDto) => {
        if (e.isLeft(mbSignInDto)) {
          return toLeftObs(mbSignInDto.left);
        }

        return this.repo.findUser({ loginCode: mbSignInDto.right.code });
      }),
      switchMap((data) => {
        if (e.isLeft(data)) {
          return toLeftObs(data.left);
        }

        if (o.isNone(data.right)) {
          return toLeftObs(new DomainError('Login code is invalid'));
        }

        if (!AdminUserParser.verifyLoginCode(data.right.value, new Date())) {
          return toLeftObs(new DomainError('Login code is invalid'));
        }

        return AdminUserParser.generateToken(data.right.value);
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Something went wrong', err)),
      ),
    );
  }

  requestLoginCode(
    payload: unknown,
  ): Observable<e.Either<ParsingError | UnexpectedError, undefined>> {
    return AdminUserParser.toSendCodeDto(payload).pipe(
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
          map((mbSaved) => {
            return e.isLeft(mbSaved)
              ? e.left(new UnexpectedError())
              : e.right(undefined);
          }),
        );
      }),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Caught an error', err));
      }),
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
