import React, { type JSX, useMemo, useState } from 'react';

import { useOrganization } from 'src/providers';
import useDraftPlantingSiteCreate from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteCreate';
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
