import {selector} from 'recoil';
import {getSites} from '../../api/sites';

export const siteSelector = selector<number | undefined>({
  key: 'siteSelector',
  get: async ({get}) => {
    const sites = await getSites();

    return sites[0];
  },
});

export default siteSelector;
