import React, { type JSX, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';
import { DraftPlantingSite } from 'src/types/PlantingSite';

import PlantingSiteEditor from './editor/Editor';

export default function PlantingSiteDraftEdit(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const { isFetching, site } = useDraftPlantingSite({ draftId: Number(plantingSiteId) });
  const [initialSite, setInitialSite] = useState<DraftPlantingSite>();

  // The editor keeps its own copy of the site, so wait out any refetch of a stale cached draft before starting it.
  if (!initialSite && site && !isFetching) {
    setInitialSite(site);
  }

  if (initialSite !== undefined) {
    return <PlantingSiteEditor site={initialSite} />;
  }

  return <BusySpinner withSkrim={true} />;
}
