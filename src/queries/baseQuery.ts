import { BaseQueryFn, FetchArgs, FetchBaseQueryError, fetchBaseQuery } from '@reduxjs/toolkit/query';

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
      formData.append(key, JSON.stringify(val));
    } else {
      formData.append(key, String(val));

    }
  }

  return formData;
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '',
  credentials: 'include',
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
