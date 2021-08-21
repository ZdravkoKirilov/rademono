import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestWithUser } from './auth.guard';

export const WithUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: RequestWithUser = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
