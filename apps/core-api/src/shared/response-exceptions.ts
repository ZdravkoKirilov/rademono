import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpApiError } from '@end/global';

export const toBadRequest = (data: HttpApiError) => {
  return new BadRequestException(data);
};

export const toForbiddenError = (data: HttpApiError) => {
  return new ForbiddenException(data);
};

export const toUnexpectedError = (data: HttpApiError) => {
  return new InternalServerErrorException(data);
};

export const isKnownError = (err: unknown) =>
  [BadRequestException, InternalServerErrorException, ForbiddenException].some(
    (exception) => err instanceof exception,
  );
