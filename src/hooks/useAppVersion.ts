import { useMemo } from 'react';

import { ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import { useGetAppVersionQuery } from 'src/queries/appVersion/appVersion';

const currentAppVersion = import.meta.env.PUBLIC_TERRAWARE_FE_BUILD_VERSION;

// Polls the deployed build version and reports whether it differs from the running build. The RTK
// Query cache is shared, so multiple callers subscribe to the same polling request.
export const useAppVersion = () => {
  const { currentData: version } = useGetAppVersionQuery(undefined, { pollingInterval: ONE_MINUTE_INTERVAL_MS });

  const isStale = useMemo(() => !!version && version.toString().trim() !== currentAppVersion, [version]);

  return { version, isStale };
};
