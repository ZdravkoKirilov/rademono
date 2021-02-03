import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpApiError } from '@end/global';

const KnownErrors = {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
};

export const toBadRequest = (data: HttpApiError) => {
  return new KnownErrors.BadRequestException(data);
};

export const toForbiddenError = (data: HttpApiError) => {
  return new KnownErrors.ForbiddenException(data);
};

export const toUnexpectedError = (data: HttpApiError) => {
  return new KnownErrors.InternalServerErrorException(data);
};

export const isKnownError = (err: unknown) =>
  Object.values(KnownErrors).some((knownError) => err instanceof knownError);
