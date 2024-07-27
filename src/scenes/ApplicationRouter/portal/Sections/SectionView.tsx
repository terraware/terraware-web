import React, { ReactNode, useMemo } from 'react';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

import { useApplicationData } from '../../provider/Context';

type SectionViewProp = {
  children?: ReactNode;
  section: ApplicationModule;
  sectionDeliverables: ApplicationDeliverable[];
};

const SectionView = ({ children, section, sectionDeliverables }: SectionViewProp) => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();
  const { goToApplicationMap, goToApplicationSectionDeliverable } = useNavigateTo();

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
        onClick: () => goToApplicationMap(selectedApplication.id),
        status: selectedApplication?.boundary ? 'Completed' : 'Not Submitted',
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
      {children}
    </ModuleDetailsCard>
  ) : null;
};

export default SectionView;
