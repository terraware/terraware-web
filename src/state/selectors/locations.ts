import { selectorFamily } from 'recoil';
import { getLocations } from '../../api/locations';
import delay from '../../utils/delay';

export default selectorFamily({
  key: 'locationsSelector',
  get: (_requestId: number) => async () => {
    if (process.env.REACT_APP_DELAY_QUERIES === 'true') {
      await delay(2000);
    }
    return await getLocations();
  },
});
