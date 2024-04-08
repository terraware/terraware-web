import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species, SpeciesRequestError } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';

import PageForm from '../../components/common/PageForm';
import TfMain from '../../components/common/TfMain';

function initSpecies(species?: Species): Species {
  return (
    species ?? {
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
  const organizationId = selectedOrganization.id;
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const theme = useTheme();

  const createNewSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.createSpecies(record, organizationId);
      setIsBusy(false);
      if (response.requestSucceeded) {
        if (response.speciesId) {
          reloadData();
          history.push(APP_PATHS.SPECIES_DETAILS.replace(':speciesId', response.speciesId.toString()));
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
        onCancel={() => history.push(APP_PATHS.SPECIES)}
        onSave={createNewSpecies}
      >
        <Typography variant='h2' sx={{ fontSize: '24px', fontWeight: 'bold', paddingLeft: theme.spacing(3) }}>
          {strings.ADD_SPECIES}
        </Typography>
        <Container
          maxWidth={false}
          sx={{
            display: 'flex',
            margin: '0 auto',
            width: isMobile ? '100%' : '700px',
            paddingLeft: theme.spacing(isMobile ? 0 : 4),
            paddingRight: theme.spacing(isMobile ? 0 : 4),
            paddingTop: theme.spacing(5),
          }}
        >
          <Grid
            container
            width={isMobile ? '100%' : '700px'}
            sx={{
              backgroundColor: theme.palette.TwClrBg,
              borderRadius: theme.spacing(4),
              padding: theme.spacing(3),
            }}
          >
            <SpeciesDetailsForm
              gridSize={12}
              record={record}
              onChange={onChange}
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
