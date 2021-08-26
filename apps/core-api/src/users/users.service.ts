import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';

import {
  ParsingError,
  toLeftObs,
  toRightObs,
  UnexpectedError,
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
  AccessToken,
  RefreshToken,
} from '@end/global';
import { EmailService } from '@app/emails';

import { UserRepository } from './users.repository';

type CommonErrors = UnexpectedError | DomainError | ParsingError;

@Injectable()
export class UsersService {
  constructor(
    private readonly repo: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  getCurrentUser(token: unknown): Observable<Either<CommonErrors, PublicUser>> {
    return User.toAccessTokenDto({ token }).pipe(
      switchMap((mbDto) => {
        if (isLeft(mbDto)) {
          return toLeftObs(mbDto.left);
        }

        return User.decodeAccessToken(mbDto.right.token, jwt.verify);
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

          return this.repo.findUser({ public_id: mbDecoded.right.id });
        },
      ),
      switchMap((mbUser) => {
        if (isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }

        if (isNone(mbUser.right)) {
          return toLeftObs(new DomainError('InvalidAccessToken'));
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
        accessToken: AccessToken;
        refreshToken: RefreshToken;
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
          return toLeftObs(new DomainError('InvalidLoginCode'));
        }

        const user = data.right.value;

        if (!User.verifyLoginCode(user, new Date())) {
          return toLeftObs(new DomainError('InvalidLoginCode'));
        }

        return zip(
          User.generateAccessToken(user, jwt.sign),
          this.repo.saveUser(User.signIn(user)),
        ).pipe(
          switchMap(([mbTokenDto]) => {
            return User.generateRefreshToken(user, jwt.sign).pipe(
              map((mbRefreshTokenDto) => {
                if (isLeft(mbTokenDto)) {
                  return mbTokenDto;
                }
                if (isLeft(mbRefreshTokenDto)) {
                  return mbRefreshTokenDto;
                }
                return right({
                  accessToken: mbTokenDto.right.token,
                  refreshToken: mbRefreshTokenDto.right.token,
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

  refreshAuthToken(
    token: unknown,
  ): Observable<
    Either<
      CommonErrors,
      {
        accessToken: AccessToken;
        refreshToken: RefreshToken;
      }
    >
  > {
    return User.decodeRefreshToken(token, jwt.verify).pipe(
      switchMap(
        (mbDecoded): Observable<Either<CommonErrors, Option<User>>> => {
          if (isLeft(mbDecoded)) {
            return toLeftObs(mbDecoded.left);
          }
          return this.repo.findUser({ public_id: mbDecoded.right.id });
        },
      ),
      switchMap((mbUser) => {
        if (isLeft(mbUser)) {
          return toLeftObs(mbUser.left);
        }
        if (isNone(mbUser.right)) {
          return toLeftObs(new DomainError('InvalidRefreshToken'));
        }
        return zip(
          User.generateAccessToken(mbUser.right.value, jwt.sign),
          User.generateRefreshToken(mbUser.right.value, jwt.sign),
        ).pipe(
          map(([mbAccessToken, mbRefreshToken]) => {
            if (isLeft(mbAccessToken)) {
              return mbAccessToken;
            }
            if (isLeft(mbRefreshToken)) {
              return mbRefreshToken;
            }
            return right({
              accessToken: mbAccessToken.right.token,
              refreshToken: mbRefreshToken.right.token,
            });
          }),
        );
      }),
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
              return User.createUser(dto.right);
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
