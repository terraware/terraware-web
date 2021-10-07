import { atom, selector } from 'recoil';
import { getDate } from 'src/api/seeds/clock';

const timeAtom = atom({
  key: 'timeTrigger',
  default: 0,
});

export default selector<string>({
  key: 'timeSelector',
  get: async ({ get }) => {
    get(timeAtom);

    return await getDate();
  },
  set: ({ set }) => {
    set(timeAtom, (v) => v + 1);
  },
});
