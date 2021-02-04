import { selector } from 'recoil';
import { getNotifications } from '../../api/notification';
import delay from '../../utils/delay';
import notificationAtom from '../atoms/notifications';
import timerAtom from '../atoms/timer';

export default selector({
  key: 'notificationsSelector',
  get: async ({ get }) => {
    get(notificationAtom);
    get(timerAtom);
    if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
      await delay(2000);
    }
    return await (await getNotifications());
  },
});
