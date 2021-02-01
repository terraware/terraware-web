import { selectorFamily } from 'recoil';
import { getNotifications } from '../../api/notification';
import delay from '../../utils/delay';
import notificationAtom from '../atoms/notifications';

export default selectorFamily({
  key: 'notificationsSelector',
  get: (_timestamp: number) => async ({ get }) => {
    get(notificationAtom);
    if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
      await delay(2000);
    }
    return await (await getNotifications()).notifications;
  },
});
