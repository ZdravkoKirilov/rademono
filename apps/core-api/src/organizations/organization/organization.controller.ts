import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';

import { User, UnexpectedError, isLeft, map, catchError } from '@end/global';
import {
  isKnownError,
  toBadRequest,
  toForbiddenError,
  toUnexpectedError,
} from '@app/shared';

import { AuthGuard, WithUser } from '@app/users';
import { OrganizationService } from './organization.service';

@Controller('organization')
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() payload: unknown, @WithUser() user: User) {
    try {
      return this.organizationService.create(payload, user.public_id).pipe(
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
                  originalError: result.left,
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
          throw toUnexpectedError({
            message: 'Unexpected error',
            name: UnexpectedError.prototype.name,
            originalError: err,
          });
        }),
      );
    } catch (err) {
      throw toUnexpectedError({
        message: 'Unexpected error',
        name: UnexpectedError.prototype.name,
        originalError: err,
      });
    }
  }

  @Get()
  @UseGuards(AuthGuard)
  getAllForUser(@WithUser() user: User) {
    return this.organizationService.getAllForUser(user.public_id).pipe(
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
                originalError: result.left,
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

        throw toUnexpectedError({
          message: 'Unexpected error',
          name: UnexpectedError.prototype.name,
          originalError: err,
        });
      }),
    );
  }
}
