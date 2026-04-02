import { useEffect, useMemo } from 'react';

import { useLazyListObservationResultsQuery } from 'src/queries/generated/observations';

type UseObservationsProps = {
  organizationId?: number | undefined;
  plantingSiteId?: number | undefined;
};

const isValidParam = (value: number | undefined): value is number => typeof value === 'number' && value !== -1;

const useObservationResults = ({ organizationId, plantingSiteId }: UseObservationsProps) => {
  const [listObservations, listObservationsResponse] = useLazyListObservationResultsQuery();

  const hasValidParam = isValidParam(organizationId) || isValidParam(plantingSiteId);

  const observationResults = useMemo(
    () => (hasValidParam ? listObservationsResponse.currentData?.observations : undefined),
    [hasValidParam, listObservationsResponse]
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
    if (hasValidParam) {
      void listObservations(
        {
          organizationId: isValidParam(organizationId) ? organizationId : undefined,
          plantingSiteId: isValidParam(plantingSiteId) ? plantingSiteId : undefined,
        },
        true
      );
    }
  }, [listObservations, hasValidParam, organizationId, plantingSiteId]);

  return {
    isLoading: hasValidParam ? listObservationsResponse.isFetching : false,
    latestObservationResult,
    observationResults,
  };
};

export default useObservationResults;
