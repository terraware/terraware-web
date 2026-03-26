import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Dropdown } from '@terraware/web-components';

import { useLocalization, useOrganization } from 'src/providers';
import { useLazyListPlantingSitesQuery } from 'src/queries/generated/plantingSites';
import { PreferencesService } from 'src/services';

type PlantingSiteSelectorProps = {
  onChange: (plantingSiteId: number) => void;
  hideNoBoundary?: boolean;
};

export default function PlantingSiteSelector({ onChange, hideNoBoundary }: PlantingSiteSelectorProps): JSX.Element {
  // assume `requestPlantingSites` thunk has been dispatched by consumer
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>();
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();

  const [listPlantingSites, listPlantingSitesResponse] = useLazyListPlantingSitesQuery();
  const allPlantingSites = useMemo(
    () => listPlantingSitesResponse.currentData?.sites ?? [],
    [listPlantingSitesResponse]
  );

  useEffect(() => {
    if (selectedOrganization) {
      void listPlantingSites({ organizationId: selectedOrganization.id, includeZones: false }, true);
    }
  }, [listPlantingSites, selectedOrganization]);

  const filteredPlantingSites = useMemo(() => {
    return allPlantingSites?.filter((ps) => (hideNoBoundary ? !!ps.boundary : true));
  }, [allPlantingSites, hideNoBoundary]);

  const options = useMemo(() => {
    return (
      filteredPlantingSites
        ?.toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined))
        .map((site) => ({ label: site.name, value: site.id })) ?? []
    );
  }, [activeLocale, filteredPlantingSites]);

  const updateAndReloadLastSelectedSite = useCallback(
    async (id: number) => {
      if (!isNaN(id) && id !== orgPreferences.lastPlantingSiteSelected && selectedOrganization) {
        await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          ['lastPlantingSiteSelected']: id,
        });
        reloadOrgPreferences();
      }
    },
    [orgPreferences.lastPlantingSiteSelected, reloadOrgPreferences, selectedOrganization]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      const id = Number(newValue);
      setSelectedPlantingSiteId(isNaN(id) ? -1 : id);
      onChange(isNaN(id) ? -1 : id);
      void updateAndReloadLastSelectedSite(id);
    },
    [onChange, updateAndReloadLastSelectedSite]
  );

  useEffect(() => {
    if (allPlantingSites && (selectedPlantingSiteId === undefined || selectedPlantingSiteId === -1)) {
      if (orgPreferences.lastPlantingSiteSelected) {
        updateSelection(orgPreferences.lastPlantingSiteSelected);
      } else {
        updateSelection(allPlantingSites[0]?.id);
      }
    }
  }, [selectedPlantingSiteId, updateSelection, orgPreferences.lastPlantingSiteSelected, allPlantingSites]);

  return (
    <Dropdown
      placeholder={strings.SELECT}
      onChange={updateSelection}
      options={options}
      selectedValue={selectedPlantingSiteId}
    />
  );
}
