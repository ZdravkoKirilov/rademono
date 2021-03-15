import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

import { HttpApiError } from '@end/global';

export const KnownErrors = {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
};

export const toBadRequest = (data: HttpApiError) => {
  return new KnownErrors.BadRequestException(data);
};

export const toForbiddenError = (data: HttpApiError) => {
  return new KnownErrors.ForbiddenException(data);
};

export const toUnauthorizedError = (data: HttpApiError) => {
  return new KnownErrors.UnauthorizedException(data);
};

export const toUnexpectedError = (data: HttpApiError) => {
  return new KnownErrors.InternalServerErrorException(data);
};

export const isKnownError = (err: unknown) =>
  Object.values(KnownErrors).some((knownError) => err instanceof knownError);
