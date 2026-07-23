import React, { type JSX, useCallback, useEffect, useMemo, useState } from 'react';

import { Dropdown } from '@terraware/web-components';

import useOrganizationPlantingSites from 'src/hooks/useOrganizationPlantingSites';
import useUpdateUserPreferences from 'src/hooks/useUpdateUserPreferences';
import { useLocalization, useOrganization } from 'src/providers';

const ALL_PLANTING_SITES_VALUE = 'all';

type SelectedValue = number | typeof ALL_PLANTING_SITES_VALUE | undefined;

type PlantingSiteSelectorProps = {
  allowAllOption?: boolean;
  hideNoBoundary?: boolean;
  onChange: (plantingSiteId: number | undefined) => void;
};

export default function PlantingSiteSelector({
  allowAllOption,
  hideNoBoundary,
  onChange,
}: PlantingSiteSelectorProps): JSX.Element {
  // assume `requestPlantingSites` thunk has been dispatched by consumer
  const [selectedValue, setSelectedValue] = useState<SelectedValue>();
  const { activeLocale, strings } = useLocalization();
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const updateUserPreferences = useUpdateUserPreferences();

  const { plantingSites } = useOrganizationPlantingSites();

  const filteredPlantingSites = useMemo(() => {
    return plantingSites?.filter((ps) => (hideNoBoundary ? !!ps.boundary : true));
  }, [plantingSites, hideNoBoundary]);

  const sortedSites = useMemo(
    () => filteredPlantingSites?.toSorted((a, b) => a.name.localeCompare(b.name, activeLocale || undefined)) ?? [],
    [activeLocale, filteredPlantingSites]
  );

  const options = useMemo(() => {
    const siteOptions: { label: string; value: number | string }[] = sortedSites.map((site) => ({
      label: site.name,
      value: site.id,
    }));
    if (allowAllOption && siteOptions.length > 1) {
      return [{ label: strings.ALL_PLANTING_SITES, value: ALL_PLANTING_SITES_VALUE }, ...siteOptions];
    }
    return siteOptions;
  }, [sortedSites, allowAllOption, strings.ALL_PLANTING_SITES]);

  const updateAndReloadLastSelectedSite = useCallback(
    async (id: number) => {
      if (id !== orgPreferences.lastPlantingSiteSelected && selectedOrganization) {
        await updateUserPreferences({ ['lastPlantingSiteSelected']: id }, selectedOrganization.id);
        reloadOrgPreferences();
      }
    },
    [orgPreferences.lastPlantingSiteSelected, reloadOrgPreferences, selectedOrganization, updateUserPreferences]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      if (allowAllOption && newValue === ALL_PLANTING_SITES_VALUE) {
        setSelectedValue(ALL_PLANTING_SITES_VALUE);
        onChange(undefined);
        return;
      }
      const id = Number(newValue);
      if (isNaN(id)) {
        return;
      }
      setSelectedValue(id);
      onChange(id);
      void updateAndReloadLastSelectedSite(id);
    },
    [allowAllOption, onChange, updateAndReloadLastSelectedSite]
  );

  useEffect(() => {
    if (!plantingSites || selectedValue !== undefined) {
      return;
    }
    const persisted = orgPreferences.lastPlantingSiteSelected as number | undefined;
    const persistedIsValid = persisted !== undefined && sortedSites.some((s) => s.id === persisted);
    if (persistedIsValid) {
      updateSelection(persisted);
    } else if (sortedSites[0]) {
      updateSelection(sortedSites[0].id);
    }
  }, [selectedValue, updateSelection, orgPreferences.lastPlantingSiteSelected, plantingSites, sortedSites]);

  return (
    <Dropdown placeholder={strings.SELECT} onChange={updateSelection} options={options} selectedValue={selectedValue} />
  );
}
