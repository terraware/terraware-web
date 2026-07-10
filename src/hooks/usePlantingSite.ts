import { useEffect, useMemo } from 'react';

import { useLazyGetPlantingSiteQuery } from 'src/queries/generated/plantingSites';

const usePlantingSite = (plantingSiteId: number | undefined) => {
  const [getPlantingSite, getPlantingSiteResponse] = useLazyGetPlantingSiteQuery();

  const plantingSiteIdIsValid = useMemo(
    () => plantingSiteId !== undefined && !isNaN(plantingSiteId) && plantingSiteId !== -1,
    [plantingSiteId]
  );

  const plantingSite = useMemo(
    () => (plantingSiteIdIsValid ? getPlantingSiteResponse.currentData?.site : undefined),
    [getPlantingSiteResponse, plantingSiteIdIsValid]
  );

  useEffect(() => {
    if (plantingSiteId && plantingSiteIdIsValid) {
      void getPlantingSite({ id: plantingSiteId, includeStrata: false }, true);
    }
  }, [getPlantingSite, plantingSiteId, plantingSiteIdIsValid]);

  return {
    plantingSite,
    isLoading: getPlantingSiteResponse.isFetching,
    isSuccess: getPlantingSiteResponse.isSuccess,
  };
};

export default usePlantingSite;
