import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { Crumb } from 'src/components/BreadCrumbs';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';
import SectionView from './SectionView';

const SectionViewWrapper = () => {
  const { applicationSections } = useApplicationData();

  const pathParams = useParams<{ applicationId: string; sectionId: string }>();
  const sectionId = Number(pathParams.sectionId);

  const appSection = useMemo(
    () => applicationSections.find((section) => section.id === sectionId),
    [applicationSections, sectionId]
  );

  if (!appSection) {
    return null;
  }

  return <SectionView section={appSection} />;
};

const SectionViewPage = () => {
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
      <SectionViewWrapper />
    </ApplicationPage>
  );
};

export default SectionViewPage;
