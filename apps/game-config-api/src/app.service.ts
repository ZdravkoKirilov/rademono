import { Injectable } from '@nestjs/common';

import { renderKit } from '@libs/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return renderKit;
  }
}
