import { useEffect, useMemo } from 'react';

import { useOrganization, useUser } from 'src/providers/hooks';
import { useLazySearchObservationOrganizationQuery } from 'src/queries/search/observations';

type CanUpdateActivityObservation = {
  canUpdate: boolean;
  isResolved: boolean;
};

const useCanUpdateActivityObservation = (observationId?: number): CanUpdateActivityObservation => {
  const { isAllowed } = useUser();
  const { organizations } = useOrganization();

  const [searchObservationOrganization, { data: organizationId, isSuccess, isError }] =
    useLazySearchObservationOrganizationQuery();

  useEffect(() => {
    if (observationId !== undefined) {
      void searchObservationOrganization(observationId, true);
    }
  }, [observationId, searchObservationOrganization]);

  return useMemo(
    () => ({
      canUpdate: isAllowed('UPDATE_OBSERVATION', { organizationId, organizations }),
      isResolved: isSuccess || isError,
    }),
    [isAllowed, isError, isSuccess, organizationId, organizations]
  );
};

export default useCanUpdateActivityObservation;
