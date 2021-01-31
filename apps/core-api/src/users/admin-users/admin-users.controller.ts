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
} from '@nestjs/common';
import { map } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';

import { UnexpectedError } from '@end/global';

import { toBadRequest, toUnexpectedError } from '@app/shared';
import { AdminUsersService } from './admin-users.service';

@Controller('admin-users')
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Post('request-login-code')
  @HttpCode(HttpStatus.NO_CONTENT)
  requestLoginCode(@Body() payload: unknown) {
    return this.adminUsersService.requestLoginCode(payload).pipe(
      map((result) => {
        if (e.isLeft(result)) {
          switch (result.left.name) {
            case 'MalformedPayload':
              throw toBadRequest({
                message: result.left.message,
                name: result.left.name,
              });
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
