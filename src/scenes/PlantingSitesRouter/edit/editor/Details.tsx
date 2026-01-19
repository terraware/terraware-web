import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import DetailsInputForm from 'src/scenes/PlantingSitesRouter/edit/DetailsInputForm';
import strings from 'src/strings';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { UpdatedPlantingSeason } from 'src/types/Tracking';

import StepTitleDescription from './StepTitleDescription';
import { OnValidate } from './types';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: OnValidate;
  plantingSeasons?: UpdatedPlantingSeason[];
  setPlantingSeasons: (plantingSeasons: UpdatedPlantingSeason[]) => void;
  setPlantingSite: (setFn: (previousValue: DraftPlantingSite) => DraftPlantingSite) => void;
  site: DraftPlantingSite;
};

export default function Details({
  onChange,
  onValidate,
  plantingSeasons,
  setPlantingSeasons,
  setPlantingSite,
  site,
}: DetailsProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <StepTitleDescription description={[]} title={strings.DETAILS} />
      <DetailsInputForm<DraftPlantingSite>
        onChange={onChange}
        onValidate={onValidate?.apply}
        plantingSeasons={plantingSeasons}
        record={site}
        setPlantingSeasons={setPlantingSeasons}
        setRecord={setPlantingSite}
      />
    </Box>
  );
}
