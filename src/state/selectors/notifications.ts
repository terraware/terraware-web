import { selector } from 'recoil';
import { getNotifications } from '../../api/notification';
import notificationAtom from '../atoms/notifications';
import timerAtom from '../atoms/timer';

export default selector({
  key: 'notificationsSelector',
  get: async ({ get }) => {
    get(notificationAtom);
    get(timerAtom);
    return await getNotifications();
  },
});
