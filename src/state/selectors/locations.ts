import { atom, selector } from 'recoil';
import { getLocations } from '../../api/locations';
import { Locations } from '../../api/types/locations';

const locationsAtom = atom({
  key: 'locationsTrigger',
  default: 0,
});

export default selector<Locations>({
  key: 'locationsSelector',
  get: async ({ get }) => {
    get(locationsAtom);

    return await getLocations();
  },
  set: ({ set }) => {
    set(locationsAtom, (v) => v + 1);
  },
});
