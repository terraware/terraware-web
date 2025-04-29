import { useMatch } from 'react-router';

import { APP_PATHS } from 'src/constants';

const useFunderPortal = () => {
  const isFunderRoute = !!useMatch({ path: APP_PATHS.FUNDER, end: false });

  return { isFunderRoute };
};

export default useFunderPortal;
