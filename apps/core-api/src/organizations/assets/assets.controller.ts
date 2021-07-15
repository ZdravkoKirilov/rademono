import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/Either';

import { AssetService } from './asset.service';
import { isKnownError, toBadRequest, toUnexpectedError } from '@app/shared';
import { ParsingError, UnexpectedError } from '@end/global';
import { AuthGuard } from '@app/users/admin-users';

@Controller('organization/:organizationId/assets')
export class AssetsController {
  constructor(private assetService: AssetService) {}

  @Get('images')
  @UseGuards(AuthGuard)
  getImages(@Param('organizationId') organizationId: unknown) {
    return [];
  }

  @Post('images')
  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: (_req, file, cb) => {
        if (['image/jpeg'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            toBadRequest({
              message: 'Unsupported file type: ' + file.mimetype,
              name: ParsingError.name,
            }),
            false,
          );
        }
      },
    }),
  )
  async uploadImage(
    @Body() body: unknown,
    @Param('organizationId') organizationId: unknown,
    @UploadedFile() file: Express.Multer.File,
  ) {
    debugger;

    const result = await this.assetService
      .createImage(body, organizationId, file.path)
      .pipe(
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
      )
      .toPromise();

    debugger;
    return result;
  }
}
