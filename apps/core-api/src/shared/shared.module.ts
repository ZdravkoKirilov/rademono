import { Module } from '@nestjs/common';

import { UUIDv4 } from '@end/global';
import { PUBLIC_ID_GENERATOR } from './constants';

@Module({
  imports: [],
  providers: [
    {
      provide: PUBLIC_ID_GENERATOR,
      useValue: UUIDv4.generate,
    },
  ],
  exports: [
    {
      provide: PUBLIC_ID_GENERATOR,
      useValue: UUIDv4.generate,
    },
  ],
})
export class SharedModule {}
