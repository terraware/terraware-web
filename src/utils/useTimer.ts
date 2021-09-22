/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect } from 'react';
import { useResetRecoilState } from 'recoil';
import notificationsSelector from '../state/selectors/notifications';
import summarySelector from '../state/selectors/summary';

const useTimer = (delay = 60000): void => {
  if (!process.env.REACT_APP_DISABLE_RECURRENT_REQUESTS) {
    const resetNotifications = useResetRecoilState(notificationsSelector);
    const resetSummary = useResetRecoilState(summarySelector);
    useEffect(() => {
      const interval = setInterval(() => {
        resetNotifications();
        resetSummary();
      }, delay);

      return () => {
        clearInterval(interval);
      };
    }, []);
  }
};

export default useTimer;
