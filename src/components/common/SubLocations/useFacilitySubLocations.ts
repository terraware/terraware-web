import { useEffect, useMemo, useState } from 'react';

import { useLocalization } from 'src/providers/hooks';
import { useLazyListSubLocationsQuery } from 'src/queries/generated/facilities';
import { SubLocation } from 'src/types/Facility';

const byName = (activeLocale: string | null) => {
  const collator = new Intl.Collator(activeLocale ?? undefined);
  return (location1: SubLocation, location2: SubLocation) => collator.compare(location1.name, location2.name);
};

/**
 * A facility's sub-locations, sorted by name. Undefined until the first load finishes, so callers
 * can tell "not loaded yet" from "this facility has none".
 */
export const useFacilitySubLocations = (facilityId?: number) => {
  const { activeLocale } = useLocalization();
  const [listSubLocations, { data, isError }] = useLazyListSubLocationsQuery();

  useEffect(() => {
    if (facilityId) {
      void listSubLocations(facilityId, true);
    }
  }, [facilityId, listSubLocations]);

  // The cached array is frozen, so sort a copy of it.
  const subLocations = useMemo(
    () => (facilityId && data ? [...data.subLocations].sort(byName(activeLocale)) : undefined),
    [activeLocale, data, facilityId]
  );

  return { subLocations, isError };
};

/**
 * Sub-locations across several facilities, flattened into one list. Pass a stable `facilityIds`
 * reference; this reloads whenever that reference changes.
 */
export const useSubLocationsForFacilities = (facilityIds?: number[]) => {
  const [listSubLocations] = useLazyListSubLocationsQuery();
  const [subLocations, setSubLocations] = useState<SubLocation[]>([]);

  useEffect(() => {
    let active = true;

    const loadSubLocations = async () => {
      try {
        const responses = await Promise.all(
          (facilityIds ?? []).map((facilityId) => listSubLocations(facilityId, true).unwrap())
        );
        if (active) {
          setSubLocations(responses.flatMap((response) => response.subLocations));
        }
      } catch {
        if (active) {
          setSubLocations([]);
        }
      }
    };

    void loadSubLocations();

    return () => {
      active = false;
    };
  }, [facilityIds, listSubLocations]);

  return subLocations;
};
