import React, { useParams } from 'react-router-dom';

import { BusySpinner } from '@terraware/web-components';

import useDraftPlantingSite from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';

import PlantingSiteEditor from './editor/Editor';

export default function PlantingSiteDraftEdit(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const result = useDraftPlantingSite({ draftId: Number(plantingSiteId) });

  if (result.site !== undefined) {
    return <PlantingSiteEditor site={result.site} />;
  }

  return <BusySpinner withSkrim={true} />;
}
