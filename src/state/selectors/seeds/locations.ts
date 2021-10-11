import { atom, selector } from 'recoil';
import { getLocations } from 'src/api/seeds/locations';
import { StorageLocation } from 'src/api/types/locations';
import { facilityIdSelector } from './facility';

const locationsAtom = atom({
  key: 'locationsTrigger',
  default: 0,
});

export default selector<StorageLocation[]>({
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
