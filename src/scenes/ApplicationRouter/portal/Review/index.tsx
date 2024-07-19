import React from 'react';

import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';

import ReviewCard from './ReviewCard';

const ReviewView = () => {
  const { applicationSections, selectedApplication } = useApplicationData();

  if (!selectedApplication) {
    return null;
  }

  return (
    <ApplicationPage>
      {selectedApplication.status !== 'Submitted' && <ReviewCard sections={applicationSections} />}
    </ApplicationPage>
  );
};

export default ReviewView;
