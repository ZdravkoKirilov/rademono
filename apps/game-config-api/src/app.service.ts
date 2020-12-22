import { Injectable } from '@nestjs/common';

import { renderKit } from '@end/global';

@Injectable()
export class AppService {
  getHello(): string {
    return renderKit;
  }
}
