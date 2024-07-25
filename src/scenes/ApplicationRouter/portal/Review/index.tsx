import React, { useMemo } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import ApplicationPage from 'src/scenes/ApplicationRouter/portal/ApplicationPage';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ReviewCard from './ReviewCard';

const ReviewView = () => {
  const { applicationSections, selectedApplication } = useApplicationData();
  const { activeLocale } = useLocalization();

  const crumbs: Crumb[] = useMemo(
    () =>
      activeLocale && selectedApplication?.id
        ? [
            {
              name: strings.ALL_SECTIONS,
              to: APP_PATHS.APPLICATION_OVERVIEW.replace(':applicationId', `${selectedApplication.id}`),
            },
          ]
        : [],
    [activeLocale, selectedApplication?.id]
  );

  if (!selectedApplication) {
    return null;
  }

  return (
    <ApplicationPage crumbs={crumbs}>
      {selectedApplication.status !== 'Submitted' && <ReviewCard sections={applicationSections} />}
    </ApplicationPage>
  );
};

export default ReviewView;
