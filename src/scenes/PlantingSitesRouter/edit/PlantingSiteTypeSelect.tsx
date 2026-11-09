import React, { type JSX, useMemo, useState } from 'react';

import { Button, DialogBox } from '@terraware/web-components';

import { useOrganization } from 'src/providers';
import useDraftPlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteCreate';
import useSiteEditorAvailability from 'src/scenes/PlantingSitesRouter/hooks/useSiteEditorAvailability';
import strings from 'src/strings';
import { DraftPlantingSite, SiteType } from 'src/types/PlantingSite';

import DraftSiteDetailsModal from './DraftSiteDetailsModal';
import PlantingSiteSelectTypeModal2 from './PlantingSiteSelectTypeModal2';

export type PlantingSiteTypeSelectProps = {
  onClose: () => void;
};

export default function PlantingSiteTypeSelect(props: PlantingSiteTypeSelectProps): JSX.Element {
  const { onClose } = props;
  const { selectedOrganization } = useOrganization();
  const [siteType, setSiteType] = useState<SiteType>();
  const { createDraft, isCreating } = useDraftPlantingSiteCreate();
  const { isEditorAvailable, unavailableMessage } = useSiteEditorAvailability();
  // Once the flow has started, keep going if the device rotates so entered details aren't lost.
  const [hasStartedFlow, setHasStartedFlow] = useState(isEditorAvailable);
  if (isEditorAvailable && !hasStartedFlow) {
    setHasStartedFlow(true);
  }

  const site = useMemo<DraftPlantingSite | undefined>(
    () =>
      siteType && {
        createdBy: -1,
        id: -1,
        name: '',
        organizationId: selectedOrganization?.id || -1,
        siteEditStep: 'site_boundary',
        siteType,
      },
    [selectedOrganization, siteType]
  );

  if (!hasStartedFlow) {
    return (
      <DialogBox
        message={unavailableMessage}
        middleButtons={[
          <Button
            id='close-site-editor-unavailable'
            key='close'
            label={strings.CLOSE}
            onClick={onClose}
            size='medium'
          />,
        ]}
        onClose={onClose}
        open
        size='medium'
        title={strings.ADD_PLANTING_SITE}
      />
    );
  }

  if (!site) {
    return <PlantingSiteSelectTypeModal2 open onNext={setSiteType} onClose={onClose} />;
  }

  return (
    <DraftSiteDetailsModal
      busy={isCreating}
      onClose={onClose}
      onSave={createDraft}
      saveLabel={strings.NEXT}
      site={site}
      title={strings.ADD_PLANTING_SITE}
    />
  );
}
