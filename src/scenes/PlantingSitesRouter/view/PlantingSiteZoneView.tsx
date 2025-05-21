import React, { useMemo } from 'react';
import { useParams } from 'react-router';

import { APP_PATHS } from 'src/constants';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

import GenericZoneView from './GenericZoneView';

export default function PlantingSiteZoneView(): JSX.Element | undefined {
  const params = useParams<{ zoneId: string }>();
  const zoneId = Number(params.zoneId);

  const { plantingSite } = usePlantingSiteData();

  const plantingZone = useMemo(() => {
    return plantingSite?.plantingZones?.find((zone) => zone.id === zoneId);
  }, [plantingSite, zoneId]);

  if (!plantingSite || !plantingZone) {
    return undefined;
  }

  return <GenericZoneView plantingSite={plantingSite} plantingZone={plantingZone} />;
}
