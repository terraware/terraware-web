import React, { type JSX, useState } from 'react';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species, SpeciesRequestError } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

function initSpecies(species?: Species): Species {
  const now = DateTime.now().toISO();
  return (
    species ?? {
      createdTime: now,
      modifiedTime: now,
      scientificName: '',
      id: -1,
    }
  );
}

type SpeciesAddViewProps = {
  reloadData: () => void;
};

export default function SpeciesAddView({ reloadData }: SpeciesAddViewProps): JSX.Element {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id || -1; // TODO: Add null check for selectedOrganization
  const [record, setRecord, , onChangeCallback] = useForm<Species>(initSpecies());
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const newGridSize = isMobile ? 12 : 4;

  const createNewSpecies = async () => {
    if (organizationId === -1) {
      return;
    }
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.createSpecies(record, organizationId);
      setIsBusy(false);
      if (response.requestSucceeded) {
        if (response.speciesId) {
          reloadData();
          navigate(APP_PATHS.SPECIES_DETAILS.replace(':speciesId', response.speciesId.toString()));
        }
      } else {
        if (response.error === SpeciesRequestError.PreexistingSpecies) {
          setNameFormatError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
        }
      }
    }
  };

  return (
    <TfMain>
      {isBusy && <BusySpinner withSkrim={true} />}
      <PageForm
        cancelID='cancelAddSpecies'
        saveID='saveAddSpecies'
        onCancel={() => navigate(APP_PATHS.SPECIES)}
        onSave={() => void createNewSpecies()}
      >
        <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
          {strings.ADD_SPECIES}
        </Typography>
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            margin: '0 auto',
            width: '100%',
            paddingLeft: theme.spacing(isMobile ? 0 : 4),
            paddingRight: theme.spacing(isMobile ? 0 : 4),
            paddingTop: theme.spacing(5),
          }}
        >
          <Grid
            container
            width={'100%'}
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: theme.spacing(4),
              padding: theme.spacing(3),
            }}
          >
            <SpeciesDetailsForm
              gridSize={newGridSize}
              record={record}
              onChange={onChangeCallback}
              setRecord={setRecord}
              nameFormatError={nameFormatError}
              setNameFormatError={setNameFormatError}
            />
          </Grid>
        </Container>
      </PageForm>
    </TfMain>
  );
}
