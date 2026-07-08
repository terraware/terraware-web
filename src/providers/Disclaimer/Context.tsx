import { createContext, useContext } from 'react';

import { Disclaimer } from 'src/types/Disclaimer';

export type DisclaimerData = {
  disclaimer?: Disclaimer;
  accept: () => void;
};

// default values pointing to nothing
export const DisclaimerContext = createContext<DisclaimerData>({
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  accept: () => {},
});

export const useDisclaimerData = () => useContext(DisclaimerContext);
