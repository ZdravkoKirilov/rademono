import { HttpErrorResponse } from '@angular/common/http';

import { HttpApiError } from '@end/global';

export type RequestError = Omit<HttpErrorResponse, 'error'> & {
  error: HttpApiError;
};
