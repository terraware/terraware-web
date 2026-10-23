import { useEffect, useMemo } from 'react';

import { useLocalization } from 'src/providers/hooks';
import { useLazyListSubLocationsQuery } from 'src/queries/generated/facilities';
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
