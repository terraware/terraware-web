import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import { useLocalization } from 'src/providers';
import { DraftPlantingSite } from 'src/types/PlantingSite';
import { UpdatedPlantingSeason } from 'src/types/Tracking';

import DraftSiteDetailsInputForm from './DraftSiteDetailsInputForm';
import StepTitleDescription from './StepTitleDescription';
import { OnValidate } from './types';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: OnValidate;
  setPlantingSeasons: (plantingSeasons: UpdatedPlantingSeason[]) => void;
  setPlantingSite: (setFn: (previousValue: DraftPlantingSite) => DraftPlantingSite) => void;
  site: DraftPlantingSite;
};

export default function Details({
  onChange,
  onValidate,
  setPlantingSeasons,
  setPlantingSite,
  site,
}: DetailsProps): JSX.Element {
  const { strings } = useLocalization();

  return (
    <Box display='flex' flexDirection='column'>
      <StepTitleDescription description={[]} title={strings.DETAILS} />
      <DraftSiteDetailsInputForm
        onChange={onChange}
        onValidate={onValidate?.apply}
        record={site}
        setPlantingSeasons={setPlantingSeasons}
        setRecord={setPlantingSite}
      />
    </Box>
  );
}
