import { selector } from 'recoil';
import { getSites } from 'src/api/plants/sites';
import { Site } from 'src/api/types/site';

export default selector<Site[] | undefined>({
  key: 'sitesSelector',
  get: async () => {
    return await getSites();
  },
});
