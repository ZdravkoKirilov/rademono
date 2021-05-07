import { environment } from '@env';

import { Url } from '@end/global';

export const endpoints = {
  requestAuthCode: `${environment.apiHost}/admin-users/request-login-code` as Url,
  requestAuthToken: `${environment.apiHost}/admin-users/token` as Url,
  getCurrentUser: `${environment.apiHost}/admin-users/current` as Url,
  organization: `${environment.apiHost}/organization` as Url,
};
