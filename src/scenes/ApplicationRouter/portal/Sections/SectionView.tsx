import React, { useMemo } from 'react';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ApplicationModuleWithDeliverables } from 'src/types/Application';

import { useApplicationData } from '../../provider/Context';

type SectionViewProp = {
  section: ApplicationModuleWithDeliverables;
};

const SectionView = ({ section }: SectionViewProp) => {
  const { activeLocale } = useLocalization();
  const { selectedApplication } = useApplicationData();
  const { goToApplicationMap, goToApplicationSectionDeliverable } = useNavigateTo();

  const deliverableDetails = useMemo(() => {
    if (!selectedApplication) {
      return [];
    }

    const deliverables = section.deliverables.map((deliverable) => ({
      name: deliverable.name,
      onClick: () => goToApplicationSectionDeliverable(selectedApplication.id, section.id, deliverable.id),
      status: deliverable.status,
    }));

    if (section.category === 'Pre-screen') {
      deliverables.unshift({
        name: strings.PROPOSED_PROJECT_BOUNDARY,
        onClick: () => goToApplicationMap(selectedApplication.id),
        status: selectedApplication?.boundary ? 'Completed' : 'Not Submitted',
      });
    }

    return deliverables;
  }, [section, goToApplicationMap, goToApplicationSectionDeliverable]);

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

  return moduleDetails && selectedApplication ? (
    <ModuleDetailsCard
      deliverables={deliverableDetails}
      module={moduleDetails}
      projectId={selectedApplication.id}
      showSimplifiedStatus
    />
  ) : null;
};

export default SectionView;
