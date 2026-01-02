import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import GenericStratumView from './GenericStratumView';

export default function PlantingSiteStratumView(): JSX.Element | undefined {
  const params = useParams<{ plantingSiteId: string; stratumId: string }>();
  const stratumId = Number(params.stratumId);
  const plantingSiteId = Number(params.plantingSiteId);

  const { data: plantingSite } = useGetPlantingSiteQuery(plantingSiteId);

  const stratum = useMemo(() => {
    return plantingSite?.site?.strata?.find((_stratum) => _stratum.id === stratumId);
  }, [plantingSite, stratumId]);

  if (!plantingSite || !stratum) {
    return undefined;
  }

  return <GenericStratumView plantingSite={plantingSite.site} stratum={stratum} />;
}
