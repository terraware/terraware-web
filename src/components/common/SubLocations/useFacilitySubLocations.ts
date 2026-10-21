import { useEffect, useMemo } from 'react';
import { shallowEqual } from 'react-redux';

import { useLocalization } from 'src/providers/hooks';
import { api, useLazyListSubLocationsQuery } from 'src/queries/generated/facilities';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SubLocation } from 'src/types/Facility';

const byName = (activeLocale: string | null) => {
  const collator = new Intl.Collator(activeLocale ?? undefined);
  return (location1: SubLocation, location2: SubLocation) => collator.compare(location1.name, location2.name);
};

export const useFacilitySubLocations = (facilityId?: number) => {
  const { activeLocale } = useLocalization();
  const [listSubLocations, { currentData, isError }] = useLazyListSubLocationsQuery();

  useEffect(() => {
    if (facilityId) {
      void listSubLocations(facilityId, true);
    }
  }, [facilityId, listSubLocations]);

  // The cached array is frozen, so sort a copy of it.
  const subLocations = useMemo(
    () => (facilityId && currentData ? [...currentData.subLocations].sort(byName(activeLocale)) : undefined),
    [activeLocale, currentData, facilityId]
  );

  return { subLocations, isError };
};

export const useSubLocationsForFacilities = (facilityIds?: number[]) => {
  const dispatch = useAppDispatch();

  const facilityIdsKey = (facilityIds ?? []).join(',');
  const ids = useMemo(() => (facilityIdsKey ? facilityIdsKey.split(',').map(Number) : []), [facilityIdsKey]);

  useEffect(() => {
    const subscriptions = ids.map((facilityId) => dispatch(api.endpoints.listSubLocations.initiate(facilityId)));
    return () => subscriptions.forEach((subscription) => subscription.unsubscribe());
  }, [dispatch, ids]);

  return useAppSelector(
    (state) =>
      ids.flatMap((facilityId) => api.endpoints.listSubLocations.select(facilityId)(state).data?.subLocations ?? []),
    shallowEqual
  );
};
