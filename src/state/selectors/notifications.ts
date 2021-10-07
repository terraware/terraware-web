import { atom, selector } from 'recoil';
import { getNotifications } from 'src/api/seeds/notification';
import { Notifications } from 'src/api/types/notification';
import { facilityIdSelector } from './seeds/facility';

const notificationAtom = atom({
  key: 'notificationsTrigger',
  default: 0,
});

export default selector<Notifications>({
  key: 'notificationsSelector',
  get: async ({ get }) => {
    get(notificationAtom);

    const facilityId = get(facilityIdSelector);

    return await getNotifications(facilityId);
  },
  set: ({ set }) => {
    set(notificationAtom, (v) => v + 1);
  },
});
