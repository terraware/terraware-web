import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { BusySpinner } from '@terraware/web-components';

import TfMain from 'src/components/common/TfMain';
import { useGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

import GenericSiteView from './GenericSiteView';

export default function PlantingSiteView(): JSX.Element {
  const params = useParams<{ plantingSiteId: string }>();
  const plantingSiteId = Number(params.plantingSiteId);

  const { data: plantingSite, isLoading } = useGetPlantingSiteQuery(plantingSiteId);

  // Use a delay effect for loading to handle quick updates of data
  const [delayedLoading, setDelayedLoading] = useState(isLoading);
  useEffect(() => {
    if (isLoading) {
      setDelayedLoading(true); // immediately true when loading starts
    } else {
      const timeout = setTimeout(() => {
        setDelayedLoading(false); // delay turning false
      }, 500);
      return () => clearTimeout(timeout); // cleanup if loading toggles back quickly
    }
  }, [isLoading]);

  return (
    <TfMain>
      {(delayedLoading || plantingSite === undefined) && <BusySpinner withSkrim={true} />}
      {!delayedLoading && plantingSite !== undefined && <GenericSiteView plantingSite={plantingSite.site} />}
    </TfMain>
  );
}
