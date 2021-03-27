import { environment } from '@env';

export const endpoints = {
  requestAuthCode: `${environment.apiHost}/admin-users/request-login-code`,
};
