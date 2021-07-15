import { Injectable } from '@nestjs/common';

type AppConfig = {
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_HOST: string;

  ASSETS_HOST: string;
};

@Injectable()
export class AppConfigService {
  get(key: keyof AppConfig) {
    const value = process.env[key];

    if (!value) {
      throw new Error('Env variable not found: ' + key);
    }
    return value;
  }
}
