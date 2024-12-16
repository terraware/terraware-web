import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { Dropdown } from '@terraware/web-components';

import { useUser } from 'src/providers';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useAppSelector } from 'src/redux/store';
import strings from 'src/strings';

type PlantingSiteSelectorProps = {
  onChange: (plantingSiteId: number) => void;
};

export default function PlantingSiteSelector({ onChange }: PlantingSiteSelectorProps): JSX.Element {
  // assume `requestPlantingSites` thunk has been dispatched by consumer
  const plantingSites = useAppSelector(selectPlantingSites);
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>();
  const { userPreferences, updateUserPreferences } = useUser();

  const options = useMemo(
    () => plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [],
    [plantingSites]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      const id = Number(newValue);
      setSelectedPlantingSiteId(isNaN(id) ? -1 : id);
      onChange(isNaN(id) ? -1 : id);
      if (!isNaN(id) && id !== userPreferences.lastPlantingSiteSelected) {
        updateUserPreferences({ lastPlantingSiteSelected: id });
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (plantingSites && (selectedPlantingSiteId === undefined || selectedPlantingSiteId === -1)) {
      if (userPreferences.lastPlantingSiteSelected) {
        updateSelection(userPreferences.lastPlantingSiteSelected);
      } else {
        updateSelection(plantingSites[0]?.id);
      }
    }
  }, [plantingSites, selectedPlantingSiteId, updateSelection]);

  return (
    <Dropdown
      placeholder={strings.SELECT}
      onChange={updateSelection}
      options={options}
      selectedValue={selectedPlantingSiteId}
    />
  );
}
