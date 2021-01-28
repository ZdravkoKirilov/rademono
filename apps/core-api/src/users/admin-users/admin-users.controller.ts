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
import { map, catchError } from 'rxjs/operators';
import * as e from 'fp-ts/lib/Either';
import { of } from 'rxjs';

import { toHttpException, UnexpectedError } from '@end/global';

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
              return toHttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: result.left.message,
                name: result.left.name,
              });
            case 'ParsingError': {
              return toHttpException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: result.left.message,
                name: result.left.name,
                errors: result.left.errors,
              });
            }
            case 'UnexpectedError': {
              return toHttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: result.left.message,
                name: result.left.name,
              });
            }
            default: {
              return toHttpException({
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Unexpected error',
                name: UnexpectedError.prototype.name,
              });
            }
          }
        }
        return result.right;
      }),
      catchError(() =>
        of(
          toHttpException({
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Unexpected error',
            name: UnexpectedError.prototype.name,
          }),
        ),
      ),
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
