import { Dropdown } from '@terraware/web-components';
import { useAppSelector } from 'src/redux/store';
import { selectPlantingSites } from 'src/redux/features/tracking/trackingSelectors';
import { useCallback, useEffect, useMemo, useState } from 'react';
import strings from 'src/strings';

type PlantingSiteSelectorProps = {
  onChange: (plantingSiteId: number) => void;
};

export default function PlantingSiteSelector({ onChange }: PlantingSiteSelectorProps): JSX.Element {
  // assume `requestPlantingSites` thunk has been dispatched by consumer
  const plantingSites = useAppSelector(selectPlantingSites);
  const [selectedPlantingSiteId, setSelectedPlantingSiteId] = useState<number | undefined>();

  const options = useMemo(
    () => plantingSites?.map((site) => ({ label: site.name, value: site.id })) ?? [],
    [plantingSites]
  );

  const updateSelection = useCallback(
    (newValue: any) => {
      const id = Number(newValue);
      setSelectedPlantingSiteId(isNaN(id) ? -1 : id);
      onChange(isNaN(id) ? -1 : id);
    },
    [onChange, setSelectedPlantingSiteId]
  );

  useEffect(() => {
    if (plantingSites && (selectedPlantingSiteId === undefined || selectedPlantingSiteId === -1)) {
      updateSelection(plantingSites[0]?.id);
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
