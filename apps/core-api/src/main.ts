import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import express from 'express';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const options = new DocumentBuilder()
    .setTitle('Game administration')
    .setDescription('Game administration API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/swagger', app, document);

  app.use(cookieParser());
  app.enableCors({ origin: ['http://localhost:4000'] });

  const staticUrl = join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(staticUrl));

  await app.listen(3000);
}
bootstrap();
