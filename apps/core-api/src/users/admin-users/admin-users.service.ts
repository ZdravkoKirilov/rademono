import {
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  TokenDto,
  DomainError,
  AdminUser,
  PrivateAdminUser,
  switchMapRight,
} from '@end/global';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap, catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import * as o from 'fp-ts/lib/Option';

import { AdminUserRepository } from './admin-users.repository';
import { EmailService } from '@app/emails';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly repo: AdminUserRepository,
    private readonly emailService: EmailService,
  ) {}

  getCurrentUser(
    token: unknown,
  ): Observable<
    e.Either<UnexpectedError | DomainError | ParsingError, AdminUser>
  > {
    return PrivateAdminUser.toTokenDto({ token }).pipe(
      switchMap((mbDto) => {
        if (e.isLeft(mbDto)) {
          return toLeftObs(mbDto.left);
        }

        return PrivateAdminUser.decodeToken(mbDto.right.token);
      }),
      switchMap(
        (
          mbDecoded,
        ): Observable<
          e.Either<
            DomainError | ParsingError | UnexpectedError,
            o.Option<PrivateAdminUser>
          >
        > => {
          if (e.isLeft(mbDecoded)) {
            return toLeftObs(mbDecoded.left);
          }

          return this.repo.findUser({ email: mbDecoded.right.email });
        },
      ),
      switchMap((mbUser) => {
        if (e.isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        if (o.isNone(mbUser.right)) {
          return toLeftObs(new DomainError('Invalid token'));
        }

        return toRightObs(PrivateAdminUser.exposePublic(mbUser.right.value));
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to get current user', err)),
      ),
    );
  }

  requestAuthToken(
    payload: unknown,
  ): Observable<
    e.Either<ParsingError | UnexpectedError | DomainError, TokenDto>
  > {
    return PrivateAdminUser.toSignInDto(payload).pipe(
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

        if (!PrivateAdminUser.verifyLoginCode(data.right.value, new Date())) {
          return toLeftObs(new DomainError('Login code is invalid'));
        }

        return PrivateAdminUser.generateToken(data.right.value);
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Something went wrong', err)),
      ),
    );
  }

  requestLoginCode(
    payload: unknown,
  ): Observable<e.Either<ParsingError | UnexpectedError, undefined>> {
    return PrivateAdminUser.toSendCodeDto(payload).pipe(
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
              return PrivateAdminUser.create(dto.right);
            }

            return toRightObs(maybeUser.right.value);
          }),
        );
      }),
      switchMap((mbUser) => {
        if (e.isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        const userWithLoginToken = PrivateAdminUser.addLoginCode(mbUser.right);
        return this.repo
          .saveUser(userWithLoginToken)
          .pipe(map(() => e.right(userWithLoginToken)));
      }),
      switchMapRight<
        PrivateAdminUser,
        UnexpectedError | ParsingError,
        e.Either<UnexpectedError, undefined>
      >((user) => {
        return this.emailService.createLoginCodeEmail(user.email).pipe(
          map((mbSaved) => {
            return e.isLeft(mbSaved)
              ? e.left(
                  new UnexpectedError('Failed to send an email', mbSaved.left),
                )
              : e.right(undefined);
          }),
        );
      }),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Caught an error', err));
      }),
    );
  }
}
