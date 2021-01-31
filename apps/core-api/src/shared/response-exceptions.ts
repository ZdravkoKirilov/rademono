import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import { HttpApiError } from '@end/global';

export const toBadRequest = (data: HttpApiError) => {
  return new BadRequestException(data);
};

export const toUnexpectedError = (data: HttpApiError) => {
  return new InternalServerErrorException(data);
};
