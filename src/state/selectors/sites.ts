import { selector } from 'recoil';
import { getSites } from '../../api/sites';
import { Site } from '../../api/types/site';
import sessionSelector from './session';

export default selector<Site[] | undefined>({
  key: 'sitesSelector',
  get: async ({ get }) => {
    const session = get(sessionSelector);
    if (session) {
      return await getSites(session);
    }
  },
});
