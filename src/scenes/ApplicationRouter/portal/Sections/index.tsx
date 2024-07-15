import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';

import { useApplicationData } from '../../provider/Context';
import ApplicationPage from '../ApplicationPage';

const SectionView = () => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, applicationSections } = useApplicationData();
  const { goToApplicationSectionDeliverable } = useNavigateTo();

  const pathParams = useParams<{ applicationId: string; sectionId: string }>();
  const applicationId = Number(pathParams.applicationId);
  const sectionId = Number(pathParams.sectionId);

  const section = useMemo(
    () => applicationSections.find((section) => section.id === sectionId),
    [applicationSections, sectionId]
  );

  const deliverableDetails = useMemo(
    () =>
      section?.deliverables.map((deliverable) => ({
        ...deliverable,
        onClick: () => goToApplicationSectionDeliverable(applicationId, sectionId, deliverable.id),
      })),
    [applicationId, sectionId, section?.deliverables, goToApplicationSectionDeliverable]
  );

  const moduleDetails = useMemo(
    () =>
      section
        ? {
            id: section.id,
            isActive: section.status === 'Incomplete',
            name: section.name,
            overview: section.overview,
            title: activeLocale ? strings.APPLICATION : '',
          }
        : null,
    [activeLocale, section]
  );

  return (
    <ApplicationPage title={section?.name ?? ''}>
      {moduleDetails && selectedApplication && (
        <ModuleDetailsCard
          deliverables={deliverableDetails}
          module={moduleDetails}
          projectId={selectedApplication.id}
        />
      )}
    </ApplicationPage>
  );
};

export default SectionView;
