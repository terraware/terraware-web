import { selector } from 'recoil';
import { getSites } from '../../api/plants/sites';
import { Site } from '../../api/types/site';

export default selector<Site[] | undefined>({
  key: 'sitesSelector',
  get: async ({ get }) => {
    return await getSites();
  },
});
