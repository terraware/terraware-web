import { createApi, defaultSerializeQueryArgs } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import { getQueryLocale } from './locale';
import { QUERY_TAGS } from './tags';

// initialize an empty api service that we'll inject endpoints into later as needed
export const baseApi = createApi({
  baseQuery,
  reducerPath: 'rtk-query',
  tagTypes: QUERY_TAGS,
  // Fold the active locale into every cache key so switching languages subscribes each query to a
  // fresh entry and refetches localized data. The Accept-Language header itself is applied in
  // baseQuery's `prepareHeaders`; here we only make the cache vary by locale.
  serializeQueryArgs: (params) => {
    const cacheKey = defaultSerializeQueryArgs(params);
    const locale = getQueryLocale();
    return locale ? `${cacheKey}|locale=${locale}` : cacheKey;
  },
  endpoints: () => ({}),
});
