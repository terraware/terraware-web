import { useEffect, useMemo } from 'react';

import { useLazyListObservationResultsQuery } from 'src/queries/generated/observations';

type UseObservationsProps = {
  organizationId?: number | undefined;
  plantingSiteId?: number | undefined;
};

const useObservationResults = ({ organizationId, plantingSiteId }: UseObservationsProps) => {
  const [listObservations, listObservationsResponse] = useLazyListObservationResultsQuery();

  const observationResults = useMemo(
    () => listObservationsResponse.currentData?.observations,
    [listObservationsResponse]
  );

  const latestObservationResult = useMemo(
    () =>
      observationResults?.find(
        (observation) =>
          (observation.state === 'Completed' || observation.state === 'Abandoned') &&
          observation.isAdHoc === false &&
          observation.type === 'Monitoring'
      ),
    [observationResults]
  );

  useEffect(() => {
    if (organizationId || plantingSiteId) {
      void listObservations({ organizationId, plantingSiteId }, true);
    }
  }, [listObservations, organizationId, plantingSiteId]);

  return {
    isLoading: listObservationsResponse.isFetching,
    latestObservationResult,
    observationResults,
  };
};

export default useObservationResults;
