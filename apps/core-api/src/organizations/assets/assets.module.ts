import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AssetsController } from './assets.controller';
import { FilesService } from './files.service';

@Module({
  controllers: [AssetsController],
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
  ],
  providers: [FilesService],
})
export class AssetsModule {}
