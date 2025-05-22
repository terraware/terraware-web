import React, { useEffect } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const { plantingSiteId } = useParams<{ plantingSiteId: string }>();

  const { plantingSite, setSelectedPlantingSite } = usePlantingSiteData();

  useEffect(() => {
    const siteId = Number(plantingSiteId);
    setSelectedPlantingSite(siteId);
  }, [plantingSiteId, setSelectedPlantingSite]);

  return (
    <TfMain>
      {plantingSite === undefined && <BusySpinner withSkrim={true} />}
      {plantingSite !== undefined && <GenericSiteView plantingSite={plantingSite} />}
    </TfMain>
  );
}
