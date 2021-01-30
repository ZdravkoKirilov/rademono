import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type AppConfig = {
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
};

@Injectable()
export class AppConfigService {
  constructor(private readonly configService: ConfigService) {}

  get(key: keyof AppConfig) {
    const value = process.env[key];

    if (!value) {
      throw new Error('Env variable not found: ' + key);
    }
    return value;
  }

  getDBPort() {
    const port = process.env.DB_PORT;
    if (!port) {
      throw new Error('Env variable not found: DB_PORT');
    }
    const asInteger = parseInt(port);

    if (!Number.isInteger(asInteger)) {
      throw new Error('Env variable not valid: DB_PORT: ' + port);
    }
    return asInteger;
  }
}
