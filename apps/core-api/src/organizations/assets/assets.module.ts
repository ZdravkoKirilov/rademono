import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { DatabaseModule } from '@app/database';
import { SharedModule } from '@app/shared';
import { AdminUsersModule } from '@app/users/admin-users';
import { AppConfigModule, AppConfigService } from '@app/config';

import { AssetsController } from './assets.controller';
import { AssetService } from './asset.service';
import { AssetRepository } from './asset.repository';
import { ASSETS_DB } from './constants';

@Module({
  controllers: [AssetsController],
  imports: [
    DatabaseModule.forFeature(ASSETS_DB),
    AdminUsersModule,
    SharedModule,
    MulterModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        storage: diskStorage({
          destination: configService.get('ASSETS_HOST'),
          filename: (req, file, cb) => {
            const randomName = Array(32)
              .fill(null)
              .map(() => Math.round(Math.random() * 16).toString(16))
              .join('');
            return cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
        preservePath: true,
      }),
      inject: [AppConfigService],
    }),
  ],
  providers: [AssetRepository, AssetService],
})
export class AssetsModule {}
