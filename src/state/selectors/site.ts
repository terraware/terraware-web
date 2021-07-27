import { selector } from 'recoil';
import { Site } from '../../api/types/site';
import projectIdSelector from './projectId';
import sitesSelector from './sites';

export default selector<Site | undefined>({
  key: 'siteSelector',
  get: ({ get }) => {
    const sites = get(sitesSelector);
    const projectId = get(projectIdSelector);

    return sites?.find((site) => site.id === projectId);
  },
});
