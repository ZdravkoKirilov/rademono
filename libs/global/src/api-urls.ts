import { OrganizationId } from './organization-entities';
import { GenericPath } from './types';

export enum ApiUrls {
  getLoginCode = '/users/code',
  getAuthToken = '/users/token',
  getCurrentUser = '/users/current',
  collections = '/organization/:organizationId/collections',
}

export const buildApiUrls = {
  collections: (organizationId: OrganizationId) =>
    buildEndpointWithParams(ApiUrls.collections, { organizationId }),
};

const buildEndpointWithParams = (
  url: string,
  params: Record<string, unknown>,
): GenericPath => {
  return url
    .split('/')
    .map((elem) => {
      if (elem.startsWith(':')) {
        return params[elem.substr(1)];
      }
      return elem;
    })
    .join('/') as GenericPath;
};
