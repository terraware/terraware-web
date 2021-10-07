import { atom, selector } from 'recoil';
import { getLocations } from '../../../api/seeds/locations';
import { Locations } from '../../../api/types/locations';
import { facilityIdSelector } from '../facility';

const locationsAtom = atom({
  key: 'locationsTrigger',
  default: 0,
});

export default selector<Locations>({
  key: 'locationsSelector',
  get: async ({ get }) => {
    get(locationsAtom);

    const facilityId = get(facilityIdSelector);

    return await getLocations(facilityId);
  },
  set: ({ set }) => {
    set(locationsAtom, (v) => v + 1);
  },
});
