import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import GenericStratumView from './GenericStratumView';

export default function PlantingSiteStratumView(): JSX.Element | undefined {
  const params = useParams<{ plantingSiteId: string; zoneId: string }>();
  const zoneId = Number(params.zoneId);
  const plantingSiteId = Number(params.plantingSiteId);

  const { data: plantingSite } = useGetPlantingSiteQuery(plantingSiteId);

  const plantingZone = useMemo(() => {
    return plantingSite?.site?.strata?.find((zone) => zone.id === zoneId);
  }, [plantingSite, zoneId]);

  if (!plantingSite || !plantingZone) {
    return undefined;
  }

  return <GenericStratumView plantingSite={plantingSite.site} plantingZone={plantingZone} />;
}
