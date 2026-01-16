import React, { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import {
  useLazyListAdHocObservationResultsQuery,
  useLazyListObservationResultsQuery,
} from 'src/queries/generated/observations';
import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';
import { useDefaultTimeZone } from 'src/utils/useTimeZoneUtils';

import ObservationMap from './ObservationMap';

type MapProps = {
  isBiomass?: boolean;
  plantingSiteId?: number;
  selectPlantingSiteId: (siteId: number) => void;
};

const Map = ({ isBiomass, plantingSiteId, selectPlantingSiteId }: MapProps): JSX.Element => {
  const { selectedOrganization } = useOrganization();
  const defaultTimezone = useDefaultTimeZone().get().id;

  const [getPlantingSite, getPlantingSiteResult] = useLazyGetPlantingSiteQuery();
  const [listObservationResults, listObservationsResultsResponse] = useLazyListObservationResultsQuery();
  const [listAdHocObservationResults, listAdHocObservationResultsResponse] = useLazyListAdHocObservationResultsQuery();

  useEffect(() => {
    if (plantingSiteId !== undefined) {
      void getPlantingSite(plantingSiteId, true);
    }
  }, [getPlantingSite, isBiomass, plantingSiteId, selectedOrganization]);

  const plantingSite = useMemo(() => getPlantingSiteResult.data?.site, [getPlantingSiteResult.data?.site]);

  useEffect(() => {
    if (selectedOrganization && plantingSiteId !== undefined) {
      void listAdHocObservationResults(
        {
          organizationId: selectedOrganization.id,
          plantingSiteId,
          includePlants: true,
        },
        true
      );
      if (!isBiomass) {
        void listObservationResults(
          {
            organizationId: selectedOrganization.id,
            plantingSiteId,
            includePlants: true,
          },
          true
        );
      }
    }
  }, [isBiomass, listAdHocObservationResults, listObservationResults, plantingSiteId, selectedOrganization]);

  const adHocObservationResults = useMemo(() => {
    if (listAdHocObservationResultsResponse.isSuccess) {
      return listAdHocObservationResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listAdHocObservationResultsResponse]);

  const observationResults = useMemo(() => {
    if (listObservationsResultsResponse.isSuccess) {
      return listObservationsResultsResponse.data.observations.filter(
        (observation) => observation.type === (isBiomass ? 'Biomass Measurements' : 'Monitoring')
      );
    } else {
      return [];
    }
  }, [isBiomass, listObservationsResultsResponse]);

  return (
    <ObservationMap
      adHocObservationResults={adHocObservationResults}
      isBiomass={isBiomass}
      observationResults={observationResults}
      plantingSiteId={plantingSiteId}
      selectPlantingSiteId={selectPlantingSiteId}
    />
  );
};

export default Map;
