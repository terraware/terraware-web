import React, { useCallback, useMemo } from 'react';

import DisclaimerPage from 'src/components/Disclaimer/DisclaimerPage';
import { useUser } from 'src/providers/hooks';
import { useAcceptDisclaimerMutation, useGetDisclaimerQuery } from 'src/queries/generated/disclaimer';

import { DisclaimerContext } from './Context';

type Props = {
  children: React.ReactNode;
};

const DisclaimerProvider = ({ children }: Props) => {
  const { user } = useUser();
  const isFunder = user?.userType === 'Funder';

  const { currentData } = useGetDisclaimerQuery(undefined, { skip: !isFunder });
  const [acceptDisclaimer] = useAcceptDisclaimerMutation();

  const disclaimer = currentData?.disclaimer;

  // Accepting invalidates the Disclaimer tag, which refetches getDisclaimer automatically.
  const accept = useCallback(() => {
    void acceptDisclaimer();
  }, [acceptDisclaimer]);

  const data = useMemo(
    () => ({
      accept,
      disclaimer,
    }),
    [accept, disclaimer]
  );

  return (
    <DisclaimerContext.Provider value={data}>
      {disclaimer && disclaimer.acceptedOn === undefined ? <DisclaimerPage /> : <>{children}</>}
    </DisclaimerContext.Provider>
  );
};

export default DisclaimerProvider;
