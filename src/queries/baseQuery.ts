import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query';

import { getQueryLocale } from './locale';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(() => resolve(), ms));
}

function objectToFormData(value: Record<string, unknown>) {
  const formData = new FormData();

  for (const [key, val] of Object.entries(value)) {
    // eslint-disable-next-line eqeqeq
    if (val == null) {
      continue;
    }

    if (val instanceof Blob) {
      formData.append(key, val);
    } else if (typeof val === 'object') {
      // Object parts default to application/json in the OpenAPI multipart encoding, so send them as
      // a JSON blob rather than a plain text field for the backend to deserialize correctly.
      formData.append(key, new Blob([JSON.stringify(val)], { type: 'application/json' }));
    } else {
      formData.append(key, String(val));
    }
  }

  return formData;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
  prepareHeaders: (headers) => {
    // Send the active locale (kept in sync by LocalizationProvider) so RTK Query requests are
    // localized the same way axios requests are. Endpoints that set their own Accept-Language win.
    const locale = getQueryLocale();
    if (locale && !headers.has('Accept-Language')) {
      headers.set('Accept-Language', locale);
    }
    return headers;
  },
  paramsSerializer: (params: Record<string, unknown>) =>
    Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&'),
});

const baseQueryWithFormData: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  if (typeof args !== 'string') {
    // Hotfix for https://github.com/reduxjs/redux-toolkit/issues/3063
    // multipart-form header content-type is ignored. Detect this by casting payloads containing blobs to FormData
    const containsBlob = Object.values(args.body ?? ({} as Record<string, unknown>)).some(
      (value) => value instanceof Blob
    );

    if (containsBlob) {
      args = {
        ...args,
        body: objectToFormData(args.body as Record<string, unknown>),
      };
    }
  }

  return rawBaseQuery(args, api, extraOptions);
};

const baseQueryWithInterceptors: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const shouldDelay = import.meta.env.PUBLIC_DELAY_QUERIES === 'true';

  // --- simulate network delay (like your proxy)
  if (shouldDelay) {
    await delay(1500);
  }

  // --- measure timing
  const start = Date.now();
  const result = await baseQueryWithFormData(args, api, extraOptions);
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
