import { useEffect } from 'react';
import { requestAppVersion } from 'src/redux/features/appVersion/appVersionThunks';
import { clearInterval } from 'timers';
import { useAppDispatch } from './../redux/store';

const ONE_MINUTE_INTERVAL_MS = 5 * 1000;

// variable used to track interval references
let checkInterval: NodeJS.Timeout;

// simple hook used to setup a polling app version check
export const useAppVersion = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // trigger initial request
    dispatch(requestAppVersion());

    // clear any existing intervals
    clearInterval(checkInterval);

    // setup a interval check for new versions
    checkInterval = setInterval(() => {
      dispatch(requestAppVersion());
    }, ONE_MINUTE_INTERVAL_MS);
  }, [dispatch]);
};
