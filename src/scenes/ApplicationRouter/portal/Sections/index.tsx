import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';

const SectionView = () => {
  const { applicationSections } = useApplicationData();

  const pathParams = useParams<{ sectionId: string }>();
  const sectionId = Number(pathParams.sectionId);

  const section = useMemo(
    () => applicationSections.find((section) => section.id === sectionId),
    [applicationSections, sectionId]
  );

  return <ApplicationPage title={section?.name ?? ''}></ApplicationPage>;
};

export default SectionView;
