import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

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

const SectionViewPage = () => (
  <ApplicationPage>
    <SectionViewWrapper />
  </ApplicationPage>
);

export default SectionViewPage;
