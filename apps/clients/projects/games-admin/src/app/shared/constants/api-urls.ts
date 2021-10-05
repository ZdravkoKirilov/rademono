import { environment } from '@env';

import { ApiUrls, buildApiUrls, Url } from '@end/global';

if (environment.production && !process.env.API_HOST) {
  throw new Error('API_HOST is a required env variable');
}

const apiHost = process.env.API_HOST || environment.apiHost;

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
