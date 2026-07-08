import React from 'react';

import { useUser } from 'src/providers/hooks';
import { useGetDisclaimerQuery } from 'src/queries/generated/disclaimer';

import DisclaimerPage from './DisclaimerPage';

type Props = {
  children: React.ReactNode;
};

const DisclaimerContainer = ({ children }: Props) => {
  const { user } = useUser();
  const isFunder = user?.userType === 'Funder';

  const { currentData } = useGetDisclaimerQuery(undefined, { skip: !isFunder });
  const disclaimer = currentData?.disclaimer;

  if (disclaimer && disclaimer.acceptedOn === undefined) {
    return <DisclaimerPage />;
  }

  return <>{children}</>;
};

export default DisclaimerContainer;
