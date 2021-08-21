import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

import {
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
  TokenDto,
  DomainError,
  PublicUser,
  User,
  switchMapRight,
  Either,
  isLeft,
  Option,
  isNone,
  right,
  left,
  Observable,
  zip,
  switchMap,
  catchError,
  map,
} from '@end/global';

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
    Either<UnexpectedError | DomainError | ParsingError, PublicUser>
  > {
    return User.toTokenDto({ token }).pipe(
      switchMap((mbDto) => {
        if (isLeft(mbDto)) {
          return toLeftObs(mbDto.left);
        }

        return User.decodeToken(mbDto.right.token, jwt.verify);
      }),
      switchMap(
        (
          mbDecoded,
        ): Observable<
          Either<DomainError | ParsingError | UnexpectedError, Option<User>>
        > => {
          if (isLeft(mbDecoded)) {
            return toLeftObs(mbDecoded.left);
          }

          return this.repo.findUser({ email: mbDecoded.right.email });
        },
      ),
      switchMap((mbUser) => {
        if (isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        if (isNone(mbUser.right)) {
          return toLeftObs(new DomainError('Invalid token'));
        }

        return toRightObs(User.exposePublic(mbUser.right.value));
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Failed to get current user', err)),
      ),
    );
  }

  requestAuthToken(
    payload: unknown,
  ): Observable<
    Either<
      ParsingError | UnexpectedError | DomainError,
      {
        accessToken: TokenDto;
        refreshToken: TokenDto;
      }
    >
  > {
    return User.toSignInDto(payload).pipe(
      switchMap((mbSignInDto) => {
        if (isLeft(mbSignInDto)) {
          return toLeftObs(mbSignInDto.left);
        }

        return this.repo.findUser({ loginCode: mbSignInDto.right.code });
      }),
      switchMap((data) => {
        if (isLeft(data)) {
          return toLeftObs(data.left);
        }

        if (isNone(data.right)) {
          return toLeftObs(new DomainError('Login code is invalid'));
        }

        const user = data.right.value;

        if (!User.verifyLoginCode(user, new Date())) {
          return toLeftObs(new DomainError('Login code is invalid'));
        }

        return zip(
          User.generateToken(user, jwt.sign),
          this.repo.saveUser(User.signIn(user)),
        ).pipe(
          switchMap(([mbTokenDto]) => {
            return User.generateToken(user, jwt.sign, {
              expiresIn: '48h',
            }).pipe(
              map((mbRefreshTokenDto) => {
                if (isLeft(mbTokenDto)) {
                  return mbTokenDto;
                }
                if (isLeft(mbRefreshTokenDto)) {
                  return mbRefreshTokenDto;
                }
                return right({
                  accessToken: mbTokenDto.right,
                  refreshToken: mbRefreshTokenDto.right,
                });
              }),
            );
          }),
        );
      }),
      catchError((err) =>
        toLeftObs(new UnexpectedError('Something went wrong', err)),
      ),
    );
  }

  requestLoginCode(
    payload: unknown,
  ): Observable<Either<ParsingError | UnexpectedError, undefined>> {
    return User.toSendCodeDto(payload).pipe(
      switchMap((dto) => {
        if (isLeft(dto)) {
          return toLeftObs(dto.left);
        }
        return this.repo.findUser({ email: dto.right.email }).pipe(
          switchMap((maybeUser) => {
            if (isLeft(maybeUser)) {
              return toLeftObs(maybeUser.left);
            }

            if (isNone(maybeUser.right)) {
              return User.createAdminUser(dto.right);
            }

            return toRightObs(maybeUser.right.value);
          }),
        );
      }),
      switchMap((mbUser) => {
        if (isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        const userWithLoginToken = User.addLoginCode(mbUser.right);
        return this.repo
          .saveUser(userWithLoginToken)
          .pipe(map(() => right(userWithLoginToken)));
      }),
      switchMapRight<
        User,
        UnexpectedError | ParsingError,
        Either<UnexpectedError, undefined>
      >((user) => {
        return this.emailService.createLoginCodeEmail(user.email).pipe(
          map((mbSaved) => {
            return isLeft(mbSaved)
              ? left(
                  new UnexpectedError('Failed to send an email', mbSaved.left),
                )
              : right(undefined);
          }),
        );
      }),
      catchError((err) => {
        return toLeftObs(new UnexpectedError('Caught an error', err));
      }),
    );
  }
}
