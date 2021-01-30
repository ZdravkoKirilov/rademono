import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'path';

import { AppConfigService } from './providers';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: path.resolve(
        __dirname,
        `../../.env.${process.env.NODE_ENV}`,
      ),
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [ConfigModule, AppConfigService],
})
export class AppConfigModule {}
