import React, { useMemo } from 'react';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import SectionView from 'src/scenes/ApplicationRouter/portal/Sections/SectionView';
import { useApplicationData } from 'src/scenes/ApplicationRouter/provider/Context';
import strings from 'src/strings';

import ApplicationPage from '../ApplicationPage';

const PrescreenView = () => {
  const { selectedApplication, applicationDeliverables, applicationSections } = useApplicationData();

  const prescreenSection = useMemo(
    () => applicationSections.find((section) => section.phase === 'Pre-Screen'),
    [applicationSections]
  );

  const prescreenDeliverables = useMemo(
    () => applicationDeliverables.filter((deliverable) => deliverable.moduleId === prescreenSection?.moduleId),
    [applicationDeliverables, prescreenSection]
  );

  if (!selectedApplication || !prescreenSection) {
    return null;
  }

  return <SectionView section={prescreenSection} sectionDeliverables={prescreenDeliverables} />;
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
