import { selector } from 'recoil';
import { getSites } from '../../api/plants/sites';
import { SiteElement } from '../../api/types/site';

export default selector<SiteElement[] | undefined>({
  key: 'sitesSelector',
  get: async () => {
    return await getSites();
  },
});
