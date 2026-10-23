import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { api } from 'src/queries/generated/facilities';
import { useAppDispatch, useAppSelector } from 'src/redux/store';

export const useSubLocationsForFacilities = (facilityIds?: number[]) => {
  const dispatch = useAppDispatch();

  const facilityIdsKey = (facilityIds ?? []).join(',');
  const ids = useMemo(() => (facilityIdsKey ? facilityIdsKey.split(',').map(Number) : []), [facilityIdsKey]);

  useEffect(() => {
    const subscriptions = ids.map((facilityId) =>
      dispatch(api.endpoints.listSubLocations.initiate(facilityId, { forceRefetch: true }))
    );
    return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [dispatch, ids]);

  return useAppSelector(
    (state) =>
      ids.flatMap((facilityId) => api.endpoints.listSubLocations.select(facilityId)(state).data?.subLocations ?? []),
    shallowEqual
  );
};
