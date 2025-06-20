import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization, useOrganization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { PreferencesService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

type PlantingSiteDropdownProps = {
  canSelectAll?: boolean;
  onChange: (plantingSiteId: number | 'all') => void;
  plantingSites: PlantingSite[];
  preferenceKey?: string;
};

export default function PlantingSiteDropdown({
  canSelectAll,
  onChange,
  plantingSites,
  preferenceKey,
}: PlantingSiteDropdownProps): JSX.Element {
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | 'all'>();

  const { activeLocale } = useLocalization();
  const { selectedOrganization, orgPreferences, reloadOrgPreferences } = useOrganization();
  const { allPlantingSites } = usePlantingSiteData();

  const allSiteOption = useMemo((): DropdownItem => {
    return {
      label: activeLocale ? strings.ALL_PLANTING_SITES : 'ALL',
      value: 'all',
    };
  }, [activeLocale]);

  const options = useMemo(() => {
    const _options = plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [];
    if (canSelectAll) {
      return [..._options, allSiteOption];
    } else {
      return _options;
    }
  }, [allSiteOption, canSelectAll, plantingSites]);

  const updateAndReloadLastSelectedSite = useCallback(
    async (id: number | 'all') => {
      if (preferenceKey && id !== orgPreferences[preferenceKey] && selectedOrganization) {
        await PreferencesService.updateUserOrgPreferences(selectedOrganization.id, {
          [preferenceKey]: id,
        });
        reloadOrgPreferences();
      }
    },
    [orgPreferences, preferenceKey, reloadOrgPreferences, selectedOrganization]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      void updateAndReloadLastSelectedSite(newValue);
      if (newValue !== 'all') {
        const id = Number(newValue);
        setSelectedPlantingSiteId(id);
        onChange(id);
      } else {
        onChange('all');
      }
    },
    [onChange, updateAndReloadLastSelectedSite]
  );

  useEffect(() => {
    if (allPlantingSites && selectedPlantingSiteId === undefined && preferenceKey) {
      if (orgPreferences[preferenceKey]) {
        updateSelection(orgPreferences[preferenceKey]);
      } else {
        updateSelection(allPlantingSites[0]?.id);
      }
    }
  }, [selectedPlantingSiteId, updateSelection, allPlantingSites, preferenceKey, orgPreferences]);

  return (
    <Dropdown
      placeholder={strings.SELECT}
      onChange={updateSelection}
      options={options}
      selectedValue={selectedPlantingSiteId}
    />
  );
}
