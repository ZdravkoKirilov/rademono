import { Injectable } from '@nestjs/common';

import { gosho } from '@libs/game-mechanics';

@Injectable()
export class AppService {
  getHello(): string {
    return gosho;
  }
}
