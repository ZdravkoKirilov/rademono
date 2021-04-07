import { BehaviorSubject } from 'rxjs';

import { useMutation, MutateParams } from './useMutation';
import { useCachedQuery, CachedQueryParams } from './useQuery';

export const useResource = <InternalResource>(
  initialValue?: InternalResource,
) => {
  const cache$ = new BehaviorSubject(initialValue || null);

  const query = <RemoteResource, ErrorResponse>(
    params: Omit<CachedQueryParams<RemoteResource, InternalResource>, 'cache'>,
  ) =>
    useCachedQuery<RemoteResource, InternalResource | null, ErrorResponse>({
      ...params,
      cache: cache$,
    });

  const mutate = <ReturnValue, ErrorResponse>(
    params: Omit<
      MutateParams<ReturnValue, InternalResource | null, ErrorResponse>,
      'cache'
    >,
  ) =>
    useMutation({
      ...params,
      cache: cache$,
    });

  return {
    query,
    mutate,
  };
};
