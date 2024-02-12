import { Typography, useTheme, Box } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import React, { useEffect, useState } from 'react';
import { Species } from 'src/types/Species';
import { useOrganization } from 'src/providers/hooks';
import { SpeciesService } from 'src/services';

import TfMain from '../../components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useHistory, useParams } from 'react-router-dom';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import PageSnackbar from 'src/components/PageSnackbar';
import useSnackbar from 'src/utils/useSnackbar';
import PageForm from '../../components/common/PageForm';
import useForm from 'src/utils/useForm';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import strings from 'src/strings';

function initSpecies(species?: Species): Species {
  return (
    species ?? {
      scientificName: '',
      id: -1,
    }
  );
}

export default function SpeciesEditView(): JSX.Element {
  const theme = useTheme();
  const [species, setSpecies] = useState<Species>();
  const history = useHistory();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const snackbar = useSnackbar();
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  // useEffect(() => {
  //   setRecord({
  //     scientificName: species?.scientificName || '',
  //     commonName: species?.commonName,
  //     id: species?.id ?? -1,
  //     familyName: species?.familyName,
  //     conservationCategory: species?.conservationCategory,
  //     growthForm: species?.growthForm,
  //     seedStorageBehavior: species?.seedStorageBehavior,
  //     ecosystemTypes: species?.ecosystemTypes,
  //   });
  // }, [species, setRecord, selectedOrganization]);

  const goToSpecies = (id?: number) => {
    const speciesLocation = {
      pathname: APP_PATHS.SPECIES + (id ? `/${id}` : ''),
    };
    history.push(speciesLocation);
  };

  const saveSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.updateSpecies(record, selectedOrganization.id);
      setIsBusy(false);
      if (response.requestSucceeded) {
        goToSpecies(record.id);
      } else {
        snackbar.toastError();
      }
    }
  };

  return (
    <TfMain>
      {isBusy && <BusySpinner withSkrim={true} />}
      <PageForm
        cancelID='cancelEditSpecies'
        saveID='saveEditSpecies'
        onCancel={() => goToSpecies(species?.id)}
        onSave={saveSpecies}
      >
        <Box marginBottom={theme.spacing(4)} paddingLeft={theme.spacing(3)}>
          <Typography fontSize='24px' fontWeight={600}>
            {species?.scientificName}
          </Typography>
          <PageSnackbar />
        </Box>
        <Box
          sx={{
            backgroundColor: theme.palette.TwClrBg,
            borderRadius: '32px',
            padding: theme.spacing(3),
            margin: 0,
          }}
        >
          <SpeciesDetailsForm
            gridSize={gridSize()}
            speciesId={speciesId}
            record={record}
            onChange={onChange}
            setRecord={setRecord}
            nameFormatError={nameFormatError}
            setNameFormatError={setNameFormatError}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
