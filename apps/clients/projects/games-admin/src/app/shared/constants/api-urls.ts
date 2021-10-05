import { environment } from '@env';

import { ApiUrls, buildApiUrls, Url } from '@end/global';

const apiHost = environment.apiHost + '/api';

export const endpoints = {
  requestAuthCode: Url.generate(`${apiHost}${ApiUrls.getLoginCode}`),
  requestAuthToken: Url.generate(`${apiHost}${ApiUrls.getAuthToken}`),
  getCurrentUser: Url.generate(`${apiHost}${ApiUrls.getCurrentUser}`),
  refreshAuthToken: Url.generate(`${apiHost}${ApiUrls.refreshAuthToken}`),
  logout: Url.generate(`${apiHost}${ApiUrls.logout}`),
  organization: Url.generate(`${apiHost}/organization`),

  collection: (...args: Parameters<typeof buildApiUrls.collections>) =>
    Url.generate(apiHost + buildApiUrls.collections(...args)),
};
