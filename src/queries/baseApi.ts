import { createApi } from '@reduxjs/toolkit/query/react';

import baseQuery from './baseQuery';
import { QUERY_TAGS } from './tags';

// initialize an empty api service that we'll inject endpoints into later as needed
export const baseApi = createApi({
  baseQuery,
  reducerPath: 'rtk-query',
  tagTypes: QUERY_TAGS,
  endpoints: () => ({}),
});
