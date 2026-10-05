import React, { type JSX } from 'react';

import { Box } from '@mui/material';

import { DraftPlantingSite } from 'src/types/PlantingSite';

import DraftSiteDetailsInputForm from './DraftSiteDetailsInputForm';
import { OnValidate } from './types';

export type DetailsProps = {
  onChange: (id: string, value: unknown) => void;
  onValidate?: OnValidate;
  setPlantingSite: (setFn: (previousValue: DraftPlantingSite) => DraftPlantingSite) => void;
  site: DraftPlantingSite;
};

export default function Details({ onChange, onValidate, setPlantingSite, site }: DetailsProps): JSX.Element {
  return (
    <Box display='flex' flexDirection='column'>
      <DraftSiteDetailsInputForm
        onChange={onChange}
        onValidate={onValidate?.apply}
        record={site}
        setRecord={setPlantingSite}
      />
    </Box>
  );
}
