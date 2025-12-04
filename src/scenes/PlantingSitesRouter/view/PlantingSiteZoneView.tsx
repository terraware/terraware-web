import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';

import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element | undefined {
  const params = useParams<{ plantingSiteId: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const plantingSiteId = Number(params.plantingSiteId);

  const [getPlantingSite, { data: plantingSite }] = useLazyGetPlantingSiteQuery();

  useEffect(() => {
    if (!isNaN(plantingSiteId) && plantingSiteId > 0) {
      void getPlantingSite(plantingSiteId);
    }
  }, [getPlantingSite, plantingSiteId]);

  const plantingZone = useMemo(() => {
    return plantingSite?.site?.plantingZones?.find((zone) => zone.id === zoneId);
  }, [plantingSite, zoneId]);

  if (!plantingSite || !plantingZone) {
    return undefined;
  }

  return <GenericZoneView plantingSite={plantingSite.site} plantingZone={plantingZone} />;
}
