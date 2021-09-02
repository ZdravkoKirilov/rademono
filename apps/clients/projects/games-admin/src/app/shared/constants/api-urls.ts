import { environment } from '@env';

import { ApiUrls, buildApiUrls, Url } from '@end/global';

export const endpoints = {
  requestAuthCode: Url.generate(
    `${environment.apiHost}${ApiUrls.getLoginCode}`,
  ),
  requestAuthToken: Url.generate(
    `${environment.apiHost}${ApiUrls.getAuthToken}`,
  ),
  getCurrentUser: Url.generate(
    `${environment.apiHost}${ApiUrls.getCurrentUser}`,
  ),
  refreshAuthToken: Url.generate(
    `${environment.apiHost}${ApiUrls.refreshAuthToken}`,
  ),
  logout: Url.generate(`${environment.apiHost}${ApiUrls.logout}`),
  organization: Url.generate(`${environment.apiHost}/organization`),

  collection: (...args: Parameters<typeof buildApiUrls.collections>) =>
    Url.generate(environment.apiHost + buildApiUrls.collections(...args)),
};
