import React, { useState } from 'react';
import strings from 'src/strings';
import { Link, Grid, Box, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import { Select } from '@terraware/web-components';
import { ACCESSION_2_COLLECTION_SOURCES } from 'src/types/Accession';

type Accession2PlantSiteDetailsProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
};

export default function Accession2PlantSiteDetails(props: Accession2PlantSiteDetailsProps): JSX.Element {
  const { record, onChange } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const gridSize = () => (isMobile ? 12 : 6);

  if (!isOpen) {
    return (
      <Grid item xs={12} marginTop={theme.spacing(2)}>
        <Box display='flex' justifyContent='flex-start'>
          <Link sx={{ textDecoration: 'none' }} href='#' id='addPlantSiteDescription' onClick={() => setIsOpen(true)}>
            {strings.ADD_PLANT_SITE_DESCRIPTION}
          </Link>
        </Box>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} display='flex' flexDirection={'column'} marginTop={theme.spacing(2)}>
      <Grid item xs={12}>
        <Select
          id='collectionSource'
          label={strings.COLLECTION_SOURCE}
          placeholder={strings.SELECT}
          selectedValue={record.collectionSource}
          options={ACCESSION_2_COLLECTION_SOURCES}
          onChange={(value) => onChange('collectionSource', value)}
          fullWidth={true}
          readonly={true}
        />
      </Grid>
      <Grid item xs={12} display='flex' flexDirection={isMobile ? 'column' : 'row'} marginTop={theme.spacing(2)}>
        <Grid item xs={gridSize()} sx={{ marginRight: isMobile ? 0 : theme.spacing(2) }}>
          <Textfield
            id='plantsCollectedFrom'
            value={record.plantsCollectedFrom}
            onChange={onChange}
            type='number'
            min={0}
            label={strings.NUMBER_PLANTS_COLLECTED_FROM}
          />
        </Grid>
        <Grid item xs={gridSize()} sx={{ marginTop: isMobile ? theme.spacing(2) : 0 }}>
          <Textfield
            id='founderId'
            value={record.founderId}
            onChange={onChange}
            type='text'
            label={strings.PLANT_ID + ' ' + strings.IF_APPLICABLE}
            tooltipText={strings.PLANT_ID_TOOLTIP}
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Textfield
          id='notes'
          value={record.notes}
          onChange={onChange}
          type='textarea'
          label={strings.PLANT_DESCRIPTION}
        />
      </Grid>
    </Grid>
  );
}
