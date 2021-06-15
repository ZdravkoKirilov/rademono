import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

@Controller('assets')
export class AssetsController {
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: unknown,
  ) {
    console.log(file.path);
    console.log(body);
  }
}
