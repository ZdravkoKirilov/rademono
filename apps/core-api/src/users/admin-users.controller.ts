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

import { isLeft, User, UnexpectedError, catchError, map } from '@end/global';

import {
  isKnownError,
  toBadRequest,
  toForbiddenError,
  toUnexpectedError,
} from '@app/shared';
import { AdminUsersService } from './admin-users.service';
import { AuthGuard } from './auth.guard';
import { WithUser } from './with-user';

@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('current')
  @UseGuards(AuthGuard)
  getCurrentUser(@WithUser() user: User) {
    return User.exposePublic(user || {});
  }

  @Post('token')
  requestAuthToken(
    @Body() payload: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.adminUsersService.requestAuthToken(payload).pipe(
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
                name: result.left.name,
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

        /* refresh token is valid for 48 hours */
        res.cookie('refreshToken', refreshToken.token, {
          httpOnly: true,
          expires: new Date(new Date().getTime() + 48 * 60 * 60 * 1000),
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

  @Post('request-login-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestLoginCode(@Body() payload: unknown) {
    return this.adminUsersService.requestLoginCode(payload).pipe(
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
        return result.right;
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
