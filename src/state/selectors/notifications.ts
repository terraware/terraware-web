import { atom, selector } from 'recoil';
import { getNotifications } from '../../api/notification';

export const notificationAtom = atom({
  key: 'notificationsAtom',
  default: 0,
});

export default selector({
  key: 'notificationsSelector',
  get: async ({ get }) => {
    get(notificationAtom);
    return await getNotifications();
  },
});
