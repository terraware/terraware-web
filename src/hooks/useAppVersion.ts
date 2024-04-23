import { useEffect } from 'react';

import { ONE_MINUTE_INTERVAL_MS } from 'src/constants';
import { requestAppVersion } from 'src/redux/features/appVersion/appVersionThunks';

import { useAppDispatch } from './../redux/store';

// variable used to track interval references
let checkInterval: NodeJS.Timeout;

// simple hook used to setup a polling app version check
export const useAppVersion = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // clear any existing intervals
    clearInterval(checkInterval);

    // trigger initial request
    dispatch(requestAppVersion());

    // setup a interval check for new versions
    checkInterval = setInterval(() => {
      dispatch(requestAppVersion());
    }, ONE_MINUTE_INTERVAL_MS);
  }, [dispatch]);
};
