import { selector } from 'recoil';
import { SiteElement } from '../../../api/types/site';
import projectIdSelector from './projectId';
import sitesSelector from './sites';

export default selector<SiteElement | undefined>({
  key: 'siteSelector',
  get: ({ get }) => {
    const sites = get(sitesSelector);
    const projectId = get(projectIdSelector);

    return sites?.find((site) => site.projectId === projectId);
  },
});
