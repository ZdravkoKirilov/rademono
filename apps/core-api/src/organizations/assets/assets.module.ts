import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { AssetsController } from './assets.controller';
import { AssetService } from './asset.service';

@Module({
  controllers: [AssetsController],
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
  ],
  providers: [AssetService],
})
export class AssetsModule {}
