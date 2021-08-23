import { ApiUrls, catchError, isLeft, map, UnexpectedError } from '@end/global';
import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';

import { isKnownError, toBadRequest, toUnexpectedError } from '@app/shared';

import { AuthGuard } from '@app/users';
import { CollectionService } from './collection.service';

@Controller()
export class CollectionController {
  constructor(private readonly collectionService: CollectionService) {}

  @Post(ApiUrls.collections)
  @UseGuards(AuthGuard)
  create(
    @Body() payload: unknown,
    @Param('organizationId') organizationId: unknown,
  ) {
    return this.collectionService.create(payload, organizationId).pipe(
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

  @Get(ApiUrls.collections)
  @UseGuards(AuthGuard)
  getAll(@Param('organizationId') organizationId: unknown) {
    return this.collectionService.getAll(organizationId).pipe(
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
