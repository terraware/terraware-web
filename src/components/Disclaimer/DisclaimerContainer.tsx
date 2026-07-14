import React from 'react';

import { useUser } from 'src/providers/hooks';
import { useGetDisclaimerQuery } from 'src/queries/generated/disclaimer';

import BlockingSpinner from '../common/BlockingSpinner';
import DisclaimerPage from './DisclaimerPage';

type Props = {
  children: React.ReactNode;
};

const DisclaimerContainer = ({ children }: Props) => {
  const { user } = useUser();
  const isFunder = user?.userType === 'Funder';

  const { currentData, isFetching } = useGetDisclaimerQuery(undefined, { skip: !isFunder });
  const disclaimer = currentData?.disclaimer;

  if (isFunder && isFetching) {
    return <BlockingSpinner />;
  }

  if (disclaimer && disclaimer.acceptedOn === undefined) {
    return <DisclaimerPage />;
  }

  return <>{children}</>;
};

export default DisclaimerContainer;
