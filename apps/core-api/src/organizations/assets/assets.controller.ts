import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { catchError, map } from 'rxjs/operators';
import * as e from 'fp-ts/Either';

import { AssetService } from './asset.service';
import { isKnownError, toBadRequest, toUnexpectedError } from '@app/shared';
import { UnexpectedError } from '@end/global';
import { AuthGuard } from '@app/users/admin-users';
import { applyImageRules } from './file-rules';

@Controller('organization/:organizationId/assets')
export class AssetsController {
  constructor(private assetService: AssetService) {}

  @Get('images')
  @UseGuards(AuthGuard)
  getImages(@Param('organizationId') organizationId: unknown) {
    return [];
  }

  @Delete(':assetId')
  @UseGuards(AuthGuard)
  deleteAsset(
    @Param('assetId') assetId: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.assetService.deleteAsset(assetId, organizationId);
  }

  @Post('images')
  @UseGuards(AuthGuard)
  @UseInterceptors(applyImageRules())
  async uploadImage(
    @Body() body: unknown,
    @Param('organizationId') organizationId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
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

    return result;
  }
}
