import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

import { useApplicationData } from '../../../../providers/Application/Context';
import UpdateOrUploadBoundaryModal from '../Map/UpdateOrUploadBoundaryModal';

type SectionViewProp = {
  children?: ReactNode;
  section: ApplicationModule;
  sectionDeliverables: ApplicationDeliverable[];
};

const SectionView = ({ children, section, sectionDeliverables }: SectionViewProp) => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();
  const { goToApplicationMap, goToApplicationSectionDeliverable, goToApplicationMapUpdate, goToApplicationMapUpload } =
    useNavigateTo();

  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  const onMapModalNext = useCallback(
    (type: 'Update' | 'Upload') => {
      if (selectedApplication !== undefined) {
        if (type === 'Update') {
          goToApplicationMapUpdate(selectedApplication.id);
        } else {
          goToApplicationMapUpload(selectedApplication.id);
        }
      }
    },
    [selectedApplication, goToApplicationMapUpdate, goToApplicationMapUpload]
  );

  const deliverableDetails = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }

    const deliverables = sectionDeliverables.map((deliverable) => ({
      name: deliverable.name,
      onClick: () => goToApplicationSectionDeliverable(selectedApplication.id, section.moduleId, deliverable.id),
      status: deliverable.status,
    }));

    if (section.phase === 'Pre-Screen') {
      deliverables.unshift({
        name: strings.PROPOSED_PROJECT_BOUNDARY,
        onClick: () =>
          selectedApplication.boundary ? goToApplicationMap(selectedApplication.id) : setIsMapModalOpen(true),
        status: selectedApplication.boundary ? 'Completed' : 'Not Submitted',
      });
    }

    return deliverables;
  }, [section, sectionDeliverables, goToApplicationMap, goToApplicationSectionDeliverable]);

  const moduleDetails = useMemo(
    () =>
      section
        ? {
            id: section.moduleId,
            isActive: section.status === 'Incomplete',
            name: section.name,
            overview: section.overview,
            title: activeLocale ? strings.APPLICATION : '',
          }
        : null,
    [activeLocale, section]
  );

  return moduleDetails && selectedApplication ? (
    <ModuleDetailsCard
      deliverables={deliverableDetails}
      module={moduleDetails}
      projectId={selectedApplication.id}
      showSimplifiedStatus
    >
      <UpdateOrUploadBoundaryModal
        open={isMapModalOpen}
        onClose={() => {
          setIsMapModalOpen(false);
        }}
        onNext={onMapModalNext}
      />
      {children}
    </ModuleDetailsCard>
  ) : null;
};

export default SectionView;
