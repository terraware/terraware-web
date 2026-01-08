import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
});

const baseQueryWithInterceptors: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const shouldDelay = process.env.REACT_APP_DELAY_QUERIES === 'true';

  // --- simulate network delay (like your proxy)
  if (shouldDelay) {
    await delay(1500);
  }

  // --- measure timing
  const start = Date.now();
  const result = await rawBaseQuery(args, api, extraOptions);
  const responseTime = Date.now() - start;

  if (process.env.NODE_ENV === 'development') {
    // TODO determine whether to log this elsewhere
    // eslint-disable-next-line no-console
    console.log(`[RTKQ] ${typeof args === 'string' ? args : args.url} took ${responseTime}ms`);
  }

  // --- handle 401 (redirect)
  if (result.error && result.error.status === 401) {
    const href = location.href.match('/error') ? location.origin : location.href;
    const redirect = encodeURIComponent(href);
    location.href = `/api/v1/login?redirect=${redirect}`;
  }

  return result;
};

export default baseQueryWithInterceptors;
