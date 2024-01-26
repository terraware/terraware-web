import React, { useState } from 'react';
import strings from 'src/strings';
import { Grid, Box, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/services/SeedBankService';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import { CollectionSource } from './index';
import AddLink from 'src/components/common/AddLink';

type Accession2PlantSiteDetailsProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
  opened?: boolean;
};

export default function Accession2PlantSiteDetails(props: Accession2PlantSiteDetailsProps): JSX.Element {
  const { record, onChange, opened } = props;
  const [isOpen, setIsOpen] = useState<boolean>(opened || false);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const gridSize = () => (isMobile ? 12 : 6);

  if (!isOpen) {
    return (
      <Grid item xs={12} marginTop={theme.spacing(2)}>
        <Box display='flex' justifyContent='flex-start'>
          <AddLink
            id='addPlantSiteDescription'
            onClick={() => setIsOpen(true)}
            large={true}
            text={strings.ADD_PLANT_SITE_DESCRIPTION}
          />
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} display='flex' flexDirection={'column'} marginTop={theme.spacing(2)}>
      <Grid item xs={12}>
        <CollectionSource
          id='collectionSource'
          label={strings.COLLECTION_SOURCE}
          placeholder={strings.SELECT}
          selectedValue={record.collectionSource}
          onChange={(value) => onChange('collectionSource', value)}
        />
      </Grid>
      <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} marginTop={theme.spacing(2)}>
        <Grid item xs={gridSize()} sx={{ marginRight: isMobile ? 0 : theme.spacing(2) }}>
          <Textfield
            id='plantsCollectedFrom'
            value={record.plantsCollectedFrom}
            onChange={(value) => onChange('plantsCollectedFrom', value)}
            type='number'
            min={0}
            label={strings.NUMBER_PLANTS_COLLECTED_FROM}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={{ marginTop: isMobile ? theme.spacing(2) : 0 }}>
          <Textfield
            id='plantId'
            value={record.plantId}
            onChange={(value) => onChange('plantId', value)}
            type='text'
            label={strings.PLANT_ID + ' ' + strings.IF_APPLICABLE}
            tooltipTitle={strings.TOOLTIP_ACCESSIONS_ADD_PLANT_ID}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Textfield
          id='notes'
          value={record.notes}
          onChange={(value) => onChange('notes', value)}
          type='textarea'
          label={strings.PLANT_DESCRIPTION}
        />
      </Grid>
    </Grid>
  );
}
