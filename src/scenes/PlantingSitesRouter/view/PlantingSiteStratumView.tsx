import React, { type JSX, useMemo } from 'react';
import { useParams } from 'react-router';

import usePlantingSite from 'src/hooks/usePlantingSite';

import GenericStratumView from './GenericStratumView';

export default function PlantingSiteStratumView(): JSX.Element | undefined {
  const params = useParams<{ plantingSiteId: string; stratumId: string }>();
  const stratumId = Number(params.stratumId);
  const plantingSiteId = Number(params.plantingSiteId);

  const { plantingSite } = usePlantingSite(plantingSiteId);

  const stratum = useMemo(() => {
    return plantingSite?.strata?.find((_stratum) => _stratum.id === stratumId);
  }, [plantingSite, stratumId]);

  if (!plantingSite || !stratum) {
    return undefined;
  }

  return <GenericStratumView plantingSite={plantingSite} stratum={stratum} />;
}
