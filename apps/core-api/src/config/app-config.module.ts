import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import path from 'path';

import { AppConfigService } from './providers';

const url =
  process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, `../../.env.${process.env.NODE_ENV}`)
    : path.resolve(__dirname, `../../../.env.${process.env.NODE_ENV}`);

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: url,
      isGlobal: true,
    }),
  ],
  providers: [AppConfigService],
  exports: [ConfigModule, AppConfigService],
})
export class AppConfigModule {}
