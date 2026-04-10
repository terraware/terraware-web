import { useEffect, useMemo } from 'react';

import { useLazyGetPlantingSiteHistoryQuery } from 'src/queries/generated/plantingSites';

type UsePlantingSiteHistoryProps = {
  plantingSiteId?: number;
  plantingSiteHistoryId?: number;
};

const usePlantingSiteHistory = ({ plantingSiteId, plantingSiteHistoryId }: UsePlantingSiteHistoryProps) => {
  const [getPlantingSiteHistory, { currentData: plantingSiteHistoryResponse, isFetching: isLoading }] =
    useLazyGetPlantingSiteHistoryQuery();

  const plantingSiteHistory = useMemo(() => plantingSiteHistoryResponse?.site, [plantingSiteHistoryResponse?.site]);

  useEffect(() => {
    if (plantingSiteId && plantingSiteHistoryId) {
      void getPlantingSiteHistory(
        {
          id: plantingSiteId,
          historyId: plantingSiteHistoryId,
        },
        true
      );
    }
  }, [getPlantingSiteHistory, plantingSiteHistoryId, plantingSiteId]);

  return {
    isLoading,
    plantingSiteHistory,
  };
};

export default usePlantingSiteHistory;
