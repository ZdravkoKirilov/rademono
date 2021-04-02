import { DynamicModule, Module } from '@nestjs/common';
import { MongoClient, Db } from 'mongodb';

import { AppConfigModule, AppConfigService } from '@app/config';
import { DbentityService } from './dbentity/dbentity.service';
import { DATABASE_COLLECTION, DATABASE_CONNECTION } from './constants';

@Module({
  imports: [AppConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      inject: [AppConfigService],
      useFactory: async (configService: AppConfigService): Promise<Db> => {
        try {
          const client = await MongoClient.connect(
            configService.get('DB_HOST'),
            {
              useUnifiedTopology: true,
            },
          );

          return client.db(configService.get('DB_NAME'));
        } catch (e) {
          throw e;
        }
      },
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {
  static forFeature(collectionName: string): DynamicModule {
    return {
      module: DatabaseModule,
      exports: [DbentityService],
      providers: [
        {
          provide: DATABASE_COLLECTION,
          useValue: collectionName,
        },
        DbentityService,
      ],
    };
  }
}
