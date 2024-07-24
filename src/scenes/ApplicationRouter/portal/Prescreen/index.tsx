import React, { useMemo } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';
import ResultView from './ResultView';

const PrescreenView = () => {
  const { selectedApplication, applicationSections } = useApplicationData();

  const prescreenSection = useMemo(
    () => applicationSections.find((section) => section.category === 'Pre-screen'),
    [applicationSections]
  );

  if (!selectedApplication || !prescreenSection) {
    return null;
  }

  switch (selectedApplication.status) {
    case 'Not Submitted':
      return <SectionView section={prescreenSection} />;
    case 'Failed Pre-screen':
      return (
        <ResultView feedback={selectedApplication.feedback} isFailure={true} prescreenSection={prescreenSection} />
      );
    case 'Passed Pre-screen':
    case 'Submitted':
    case 'PL Review':
    case 'Ready for Review':
    case 'Pre-check':
    case 'Needs Follow-up':
    case 'Carbon Eligible':
    case 'Accepted':
    case 'Waitlist':
    case 'Issue Active':
    case 'Issue Pending':
    case 'Issue Resolved':
    case 'Not Accepted':
    case 'In Review':
      return <ResultView isFailure={false} prescreenSection={prescreenSection} />;
  }
};

const PrescreenViewWrapper = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();

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

  return (
    <ApplicationPage crumbs={crumbs}>
      <PrescreenView />
    </ApplicationPage>
  );
};

export default PrescreenViewWrapper;
