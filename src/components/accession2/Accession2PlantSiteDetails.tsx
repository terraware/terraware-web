import React, { useState, useEffect } from 'react';
import strings from 'src/strings';
import { Link, Grid, Box, useTheme } from '@mui/material';
import { AccessionPostRequestBody } from 'src/api/accessions2/accession';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import Textfield from 'src/components/common/Textfield/Textfield';
import Autocomplete from 'src/components/common/Autocomplete';
import { Select } from '@terraware/web-components';
import { ACCESSION_2_COLLECTION_SOURCES } from 'src/types/Accession';

type Accession2PlantSiteDetailsProps = {
  record: AccessionPostRequestBody;
  onChange: (id: string, value?: any) => void;
};

export default function Accession2PlantSiteDetails(props: Accession2PlantSiteDetailsProps): JSX.Element {
  const { record, onChange } = props;
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [numPlants, setNumPlants] = useState<string>('');
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const gridSize = () => (isMobile ? 12 : 6);

  const onChangeNumPlants = (value: any) => {
    const numPlantsStr = value as string;
    setNumPlants(numPlantsStr);
    // tslint:disable-next-line: no-unnecessary-initializer
    let min = undefined;
    // tslint:disable-next-line: no-unnecessary-initializer
    let max = undefined;
    // we support either a number or a range of two numbers, eg. 2 - 5
    const numbers = value.split('-').map((num: string) => num.trim());
    if (numbers.length < 3) {
      // Parse the numbers
      min = parseInt(numbers[0], 10);
      max = parseInt(numbers[1], 10);
      const noMin = isNaN(min) || min === 0;
      const noMax = isNaN(max) || max === 0;
      if (noMin) {
        min = undefined;
      }
      if (noMax) {
        max = min;
      } else if (noMin) {
        // if we have " - 3" use 3 as min and max
        min = max;
      } else {
        // if we have "4 - 3" use 3 as min and 4 as max;
        // if we have "3 - 4" use 3 as min and 4 as max;
        const temp = min as number;
        min = Math.min(temp, max);
        max = Math.max(temp, max);
      }
    }
    onChange('plantsCollectedFromMin', min);
    onChange('plantsCollectedFromMax', max);
  };

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
            id='numPlants'
            value={numPlants}
            onChange={(unused, value) => onChangeNumPlants(value)}
            type='text'
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
          />
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
        <Textfield
          id='collectionSiteNotes'
          value={record.collectionSiteNotes}
          onChange={onChange}
          type='textarea'
          label={strings.DESCRIPTION_NOTES}
        />
      </Grid>
    </Grid>
  );
}
