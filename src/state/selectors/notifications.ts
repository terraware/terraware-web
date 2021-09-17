import { atom, selector } from 'recoil';
import { getNotifications } from '../../api/notification';
import { Notifications } from '../../api/types/notification';

const notificationAtom = atom({
  key: 'notificationsTrigger',
  default: 0,
});

export default selector<Notifications>({
  key: 'notificationsSelector',
  get: async ({ get }) => {
    get(notificationAtom);
    return await getNotifications();
  },
  set: ({ set }) => {
    set(notificationAtom, v => v + 1);
  }
});
