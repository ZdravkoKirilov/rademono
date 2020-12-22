import { Injectable } from '@nestjs/common';

import { renderKit } from '@global/shared';

@Injectable()
export class AppService {
  getHello(): string {
    return renderKit;
  }
}
