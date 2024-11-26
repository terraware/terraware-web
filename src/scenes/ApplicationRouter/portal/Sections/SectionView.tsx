import React, { ReactNode, useCallback, useMemo, useState } from 'react';

import UpdateOrUploadBoundaryModal from 'src/components/Application/UpdateOrUploadBoundaryModal';
import ModuleDetailsCard, { DeliverableDetails } from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import { useApplicationData } from 'src/providers/Application/Context';
import strings from 'src/strings';
import { ApplicationDeliverableWithBoundaryFlag, ApplicationModule } from 'src/types/Application';

import { PRESCREEN_BOUNDARY_DELIVERABLE_ID } from '../Prescreen';

type SectionViewProp = {
  children?: ReactNode;
  section: ApplicationModule;
  sectionDeliverables: ApplicationDeliverableWithBoundaryFlag[];
};

const SectionView = ({ children, section, sectionDeliverables }: SectionViewProp) => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();
  const { goToApplicationMap, goToApplicationSectionDeliverable, goToApplicationMapUpdate } = useNavigateTo();

  const [isMapModalOpen, setIsMapModalOpen] = useState<boolean>(false);

  const onMapModalNext = useCallback(
    (type: 'Update' | 'Upload') => {
      if (selectedApplication !== undefined) {
        if (type === 'Update') {
          goToApplicationMapUpdate(selectedApplication.id);
        } else {
          goToApplicationSectionDeliverable(
            selectedApplication.id,
            section.moduleId,
            PRESCREEN_BOUNDARY_DELIVERABLE_ID
          );
        }
      }
    },
    [selectedApplication, goToApplicationMapUpdate]
  );

  const deliverableDetails = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }

    const deliverables = sectionDeliverables.map(
      (deliverable): DeliverableDetails =>
        deliverable.isBoundary
          ? {
              name: strings.PROPOSED_PROJECT_BOUNDARY,
              onClick: () => {
                if (deliverable.status === 'Completed') {
                  // User has previously uploaded a shapefile
                  goToApplicationSectionDeliverable(selectedApplication.id, section.moduleId, deliverable.id);
                } else if (selectedApplication.boundary) {
                  // User has previously drawn a map boundary
                  goToApplicationMap(selectedApplication.id);
                } else {
                  setIsMapModalOpen(true);
                }
              },
              status:
                deliverable.status === 'Completed' || selectedApplication.boundary ? 'Completed' : 'Not Submitted',
            }
          : {
              name: deliverable.name,
              onClick: () =>
                goToApplicationSectionDeliverable(selectedApplication.id, section.moduleId, deliverable.id),
              status: deliverable.status,
            }
    );

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
