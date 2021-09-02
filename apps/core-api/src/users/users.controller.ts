import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  HttpCode,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';

import {
  isLeft,
  User,
  UnexpectedError,
  catchError,
  map,
  ApiUrls,
  Observable,
  PublicUser,
  AccessTokenDto,
} from '@end/global';

import {
  Cookies,
  isKnownError,
  toBadRequest,
  toForbiddenError,
  toUnexpectedError,
} from '@app/shared';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';
import { WithUser } from './with-user';

@Controller('')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(ApiUrls.getCurrentUser)
  @UseGuards(AuthGuard)
  getCurrentUser(@WithUser() user: User): PublicUser {
    return User.exposePublic(user);
  }

  @Get(ApiUrls.logout)
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) res: Response): void {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    res.cookie('rft', '', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      expires: expiration,
    });
  }

  @Get(ApiUrls.refreshAuthToken)
  refreshAuthToken(
    @Cookies('rft') refreshToken: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Observable<AccessTokenDto> {
    return this.userService.refreshAuthToken(refreshToken).pipe(
      map((result) => {
        if (isLeft(result)) {
          switch (result.left.name) {
            case 'ParsingError': {
              throw toBadRequest({
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              throw toUnexpectedError({
                message: result.left.message,
                name: result.left.name,
              });
            }
            case 'DomainError': {
              throw toForbiddenError({
                message: result.left.message,
                name: result.left.message,
                errors: result.left.errors,
              });
            }
            default: {
              throw toUnexpectedError({
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
              });
            }
          }
        }

        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 7);

        res.cookie('rft', result.right.refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          expires: expiration,
        });

        return { token: result.right.accessToken };
      }),
      catchError((err) => {
        if (isKnownError(err)) {
          throw err;
        }
        // TODO: log

        throw toUnexpectedError({
          message: 'Unexpected error',
          name: UnexpectedError.prototype.name,
          originalError: err,
        });
      }),
    );
  }

  @Post(ApiUrls.getAuthToken)
  requestAuthToken(
    @Body() payload: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Observable<AccessTokenDto> {
    return this.userService.requestAuthToken(payload).pipe(
      map((result) => {
        if (isLeft(result)) {
          switch (result.left.name) {
            case 'ParsingError': {
              throw toBadRequest({
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              throw toUnexpectedError({
                message: result.left.message,
                name: result.left.name,
              });
            }
            case 'DomainError': {
              throw toForbiddenError({
                message: result.left.message,
                name: 'Unauthorized',
                errors: result.left.errors,
              });
            }
            default: {
              throw toUnexpectedError({
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
              });
            }
          }
        }
        const { accessToken, refreshToken } = result.right;

        const expiration = new Date();
        expiration.setDate(expiration.getDate() + 7);

        res.cookie('rft', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
          expires: expiration,
        });

        return { token: accessToken };
      }),
      catchError((err) => {
        if (isKnownError(err)) {
          throw err;
        }

        // TODO: log

        throw toUnexpectedError({
          message: 'Unexpected error',
          name: UnexpectedError.prototype.name,
          originalError: err,
        });
      }),
    );
  }

  @Post(ApiUrls.getLoginCode)
  @HttpCode(HttpStatus.NO_CONTENT)
  requestLoginCode(@Body() payload: unknown): Observable<void> {
    return this.userService.requestLoginCode(payload).pipe(
      map((result) => {
        if (isLeft(result)) {
          switch (result.left.name) {
            case 'ParsingError': {
              throw toBadRequest({
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              throw toUnexpectedError({
                message: result.left.message,
                name: result.left.name,
              });
            }
            default: {
              throw toUnexpectedError({
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
              });
            }
          }
        }
      }),
      catchError((err) => {
        if (isKnownError(err)) {
          throw err;
        }

        // TODO: log

        throw toUnexpectedError({
          message: 'Unexpected error',
          name: UnexpectedError.prototype.name,
        });
      }),
    );
  }
}
