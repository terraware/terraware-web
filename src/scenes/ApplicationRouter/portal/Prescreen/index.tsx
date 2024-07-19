import React, { useMemo } from 'react';

import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';

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

  const feedback = `
    <ul>
      <li> Reason 1 description here
      <li> Reason 2 description here
      <li> Reason 3 description here
    </ul>`;

  switch (selectedApplication.status) {
    case 'Not Submitted':
      return <SectionView section={prescreenSection} />;
    case 'Failed Pre-screen':
      return <ResultView feedback={feedback} isFailure={true} prescreenSection={prescreenSection} />;
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

const PrescreenViewWrapper = () => (
  <ApplicationPage>
    <PrescreenView />
  </ApplicationPage>
);

export default PrescreenViewWrapper;
