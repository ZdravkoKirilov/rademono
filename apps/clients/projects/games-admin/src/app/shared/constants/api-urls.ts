import { environment } from '@env';

import { ApiUrls, buildApiUrls, Url } from '@end/global';

export const endpoints = {
  requestAuthCode: `${environment.apiHost}${ApiUrls.getLoginCode}` as Url,
  requestAuthToken: `${environment.apiHost}${ApiUrls.getAuthToken}` as Url,
  getCurrentUser: `${environment.apiHost}${ApiUrls.getCurrentUser}` as Url,
  organization: `${environment.apiHost}/organization` as Url,

  collection: (...args: Parameters<typeof buildApiUrls.collections>) =>
    (environment.apiHost + buildApiUrls.collections(...args)) as Url,
};
