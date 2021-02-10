import { selectorFamily } from 'recoil';
import { getLocations } from '../../api/locations';

export default selectorFamily({
  key: 'locationsSelector',
  get: (_requestId: number) => async () => {
    return await getLocations();
  },
});
