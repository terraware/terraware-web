import React, { useCallback, useEffect, useMemo } from 'react';

import { Dropdown, DropdownItem } from '@terraware/web-components';

import { useLocalization } from 'src/providers';
import { usePlantingSiteData } from 'src/providers/Tracking/PlantingSiteContext';
import { CachedUserService, PreferencesService } from 'src/services';
import strings from 'src/strings';
import { PlantingSite } from 'src/types/Tracking';

type PlantingSiteDropdownProps = {
  canSelectAll?: boolean;
  fullWidth?: boolean;
  onChange: (plantingSiteId: number | 'all') => void;
  organizationId?: number;
  plantingSites: PlantingSite[];
  preferenceKey?: string;
  selectedPlantingSiteId: number | 'all' | undefined;
};

export default function PlantingSiteDropdown({
  canSelectAll,
  fullWidth,
  onChange,
  organizationId,
  plantingSites,
  preferenceKey,
  selectedPlantingSiteId,
}: PlantingSiteDropdownProps): JSX.Element {
  const { activeLocale } = useLocalization();
  const { allPlantingSites } = usePlantingSiteData();

  const allSiteOption = useMemo((): DropdownItem => {
    return {
      label: activeLocale ? strings.ALL_PLANTING_SITES : 'ALL',
      value: 'all',
    };
  }, [activeLocale]);

  const options = useMemo(() => {
    const _options = plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [];
    if (_options.length > 0 && canSelectAll) {
      return [allSiteOption, ..._options];
    } else {
      return _options;
    }
  }, [allSiteOption, canSelectAll, plantingSites]);

  const updateAndReloadLastSelectedSite = useCallback(
    async (id: number | 'all') => {
      if (organizationId !== undefined) {
        const preferences = CachedUserService.getUserOrgPreferences(organizationId);
        if (preferenceKey && id !== preferences[preferenceKey]) {
          await PreferencesService.updateUserOrgPreferences(organizationId, {
            [preferenceKey]: id,
          });
        }
      }
    },
    [preferenceKey, organizationId]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      if (newValue !== undefined) {
        void updateAndReloadLastSelectedSite(newValue);
        if (newValue !== 'all') {
          const id = Number(newValue);
          onChange(id);
        } else {
          onChange('all');
        }
      }
    },
    [onChange, updateAndReloadLastSelectedSite]
  );

  useEffect(() => {
    if (allPlantingSites && selectedPlantingSiteId === undefined) {
      if (organizationId && preferenceKey) {
        const preferences = CachedUserService.getUserOrgPreferences(organizationId);
        const storedPreference = preferences[preferenceKey];
        if (storedPreference && (storedPreference === 'all' || typeof storedPreference === 'number')) {
          updateSelection(storedPreference);
          return;
        }
      }
      updateSelection(allPlantingSites[0]?.id);
    }
  }, [selectedPlantingSiteId, updateSelection, allPlantingSites, preferenceKey, organizationId]);

  return (
    <Dropdown
      fullWidth={fullWidth}
      placeholder={strings.SELECT}
      onChange={updateSelection}
      options={options}
      selectedValue={selectedPlantingSiteId}
    />
  );
}
