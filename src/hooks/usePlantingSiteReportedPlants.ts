import { useEffect, useMemo } from 'react';

import { useOrganization } from 'src/providers';
import { useLazyGetPlantingSiteReportedPlantsQuery } from 'src/queries/generated/plantingSites';

const usePlantingSiteReportedPlants = (plantingSiteId: number | undefined) => {
  const { selectedOrganization } = useOrganization();
  const [listReportedPlants, listReportedPlantsResponse] = useLazyGetPlantingSiteReportedPlantsQuery();

  const plantingSiteIdIsValid = useMemo(
    () => plantingSiteId !== undefined && !isNaN(plantingSiteId) && plantingSiteId !== -1,
    [plantingSiteId]
  );

  const plantingSiteReportedPlants = useMemo(
    () => (plantingSiteIdIsValid ? listReportedPlantsResponse.currentData?.site : undefined),
    [listReportedPlantsResponse, plantingSiteIdIsValid]
  );

  useEffect(() => {
    if (selectedOrganization && plantingSiteId && plantingSiteIdIsValid) {
      void listReportedPlants(plantingSiteId, true);
    }
  }, [listReportedPlants, plantingSiteId, plantingSiteIdIsValid, selectedOrganization]);

  return {
    isLoading: listReportedPlantsResponse.isFetching,
    plantingSiteReportedPlants,
  };
};

export default usePlantingSiteReportedPlants;
