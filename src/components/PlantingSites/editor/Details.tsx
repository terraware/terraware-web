import { useState } from 'react';
import { Box } from '@mui/material';
import { PlantingSite, UpdatedPlantingSeason } from 'src/types/Tracking';
import DetailsInputForm from 'src/components/PlantingSites/DetailsInputForm';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: (hasErrors: boolean) => void;
  setPlantingSite: (setFn: (previousValue: PlantingSite) => PlantingSite) => void;
  site: PlantingSite;
};

export default function Details({ onChange, onValidate, setPlantingSite, site }: DetailsProps): JSX.Element {
  const [plantingSeasons, setPlantingSeasons] = useState<UpdatedPlantingSeason[]>();

  return (
    <Box display='flex' flexDirection='column'>
      <DetailsInputForm
        onChange={onChange}
        onValidate={onValidate}
        plantingSeasons={plantingSeasons}
        record={site}
        setPlantingSeasons={setPlantingSeasons}
        setRecord={setPlantingSite}
      />
    </Box>
  );
}
