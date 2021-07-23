import { selector } from 'recoil';
import { Site } from '../../api/types/site';
import projectSelector from './project';
import sitesSelector from './sites';

export default selector<Site | undefined>({
  key: 'siteSelector',
  get: ({ get }) => {
    const sites = get(sitesSelector);
    const project = get(projectSelector);

    return sites?.find((site) => site.id === project?.id);
  },
});
