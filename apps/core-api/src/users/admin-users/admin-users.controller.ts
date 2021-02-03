import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';

import {
  AdminUserParser,
  PrivateAdminUser,
  UnexpectedError,
} from '@end/global';

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
  getCurrentUser(@WithUser() user: PrivateAdminUser) {
    return AdminUserParser.exposePublic(user || {});
  }

  @Post('token')
  requestAuthToken(@Body() payload: unknown) {
    return this.adminUsersService.requestAuthToken(payload).pipe(
      map((result) => {
        if (e.isLeft(result)) {
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

  @Post('request-login-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestLoginCode(@Body() payload: unknown) {
    return this.adminUsersService.requestLoginCode(payload).pipe(
      map((result) => {
        if (e.isLeft(result)) {
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

  @Get()
  findAll() {
    return this.adminUsersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminUsersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() payload: unknown) {
    return this.adminUsersService.update(+id, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminUsersService.remove(+id);
  }
}
