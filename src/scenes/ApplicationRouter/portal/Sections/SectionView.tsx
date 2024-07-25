import React, { useCallback, useMemo } from 'react';

import { Button } from '@terraware/web-components';

import ModuleDetailsCard from 'src/components/ModuleDetailsCard';
import useNavigateTo from 'src/hooks/useNavigateTo';
import { useLocalization } from 'src/providers';
import strings from 'src/strings';
import { ApplicationDeliverable, ApplicationModule } from 'src/types/Application';

import { useApplicationData } from '../../provider/Context';

type SectionViewProp = {
  section: ApplicationModule;
  sectionDeliverables: ApplicationDeliverable[];
};

const SectionView = ({ section, sectionDeliverables }: SectionViewProp) => {
  const { activeLocale } = useLocalization();
  const { selectedApplication, restart, submit, reload } = useApplicationData();
  const { goToApplication, goToApplicationMap, goToApplicationSectionDeliverable, goToApplicationPrescreenResult } =
    useNavigateTo();

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

  const allDeliverablesCompleted = useMemo(
    () => sectionDeliverables.every((deliverable) => deliverable.status !== 'Not Submitted'),
    [sectionDeliverables]
  );

  const handleRestart = useCallback(async () => {
    if (selectedApplication) {
      await restart();
      await reload();
      goToApplication(selectedApplication.id);
    }
  }, [selectedApplication, reload, restart, goToApplication]);

  const handleSubmit = useCallback(async () => {
    console.log(submit);
    if (selectedApplication) {
      await submit();
      await reload();
      goToApplicationPrescreenResult(selectedApplication.id);
    }
  }, [selectedApplication, reload, submit, goToApplicationPrescreenResult]);

  return moduleDetails && selectedApplication ? (
    <ModuleDetailsCard
      deliverables={deliverableDetails}
      module={moduleDetails}
      projectId={selectedApplication.id}
      showSimplifiedStatus
    >
      {section.phase === 'Pre-Screen' && selectedApplication.status === 'Not Submitted' && (
        <Button
          disabled={!allDeliverablesCompleted && false}
          label={strings.SUBMIT_PRESCREEN}
          onClick={() => {
            handleSubmit();
          }}
          priority='primary'
        />
      )}

      {section.phase === 'Pre-Screen' && selectedApplication.status !== 'Not Submitted' && (
        <Button
          label={strings.RESTART_PRESCREEN}
          onClick={() => {
            handleRestart();
          }}
          priority='secondary'
        />
      )}
    </ModuleDetailsCard>
  ) : null;
};

export default SectionView;
