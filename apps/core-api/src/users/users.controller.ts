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
  AccessToken,
  PublicUser,
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
    res.cookie('rft', '', {
      httpOnly: true,
      sameSite: 'none',
    });
  }

  @Get(ApiUrls.refreshAuthToken)
  refreshAuthToken(
    @Cookies('rft') refreshToken: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Observable<AccessToken> {
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

        res.cookie('rft', result.right.refreshToken, {
          httpOnly: true,
          sameSite: 'none',
        });

        return result.right.accessToken;
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
  ): Observable<AccessToken> {
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

        res.cookie('rft', refreshToken, {
          httpOnly: true,
          sameSite: 'none',
        });

        return accessToken;
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
