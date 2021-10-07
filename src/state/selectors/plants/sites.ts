import { selector } from 'recoil';
import { getSites } from 'src/api/plants/sites';
import { SiteElement } from 'src/api/types/site';

export default selector<SiteElement[] | undefined>({
  key: 'sitesSelector',
  get: async () => {
    return await getSites();
  },
});
