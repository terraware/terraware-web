import React from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { selectDraftPlantingSite } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { searchDraftPlantingSiteSubzones } from 'src/redux/features/draftPlantingSite/draftPlantingSiteSelectors';
import { useAppSelector } from 'src/redux/store';
import useDraftPlantingSiteGet from 'src/scenes/PlantingSitesRouter/hooks/useDraftPlantingSiteGet';

import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element | undefined {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();
  const { status } = useDraftPlantingSiteGet({ draftId: Number(plantingSiteId) });
  const plantingSite = useAppSelector((state) => selectDraftPlantingSite(state, Number(plantingSiteId)));
  const plantingZone = useAppSelector((state) => searchDraftPlantingSiteSubzones(state, Number(plantingSiteId)));

  if (status === 'pending') {
    return <BusySpinner />;
  }

  if (!plantingSite || !plantingZone) {
    return undefined;
  }

  return (
    <GenericZoneView
      plantingSite={plantingSite}
      plantingZone={plantingZone}
      siteViewPrefix='/draft'
      siteViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
      subzoneViewUrl={APP_PATHS.PLANTING_SITES_DRAFT_VIEW}
    />
  );
}
