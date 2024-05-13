import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Grid, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import TextField from '@terraware/web-components/components/Textfield/Textfield';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useDeliverableData } from 'src/providers/Deliverable/DeliverableContext';
import { useParticipantProjectSpeciesData } from 'src/providers/ParticipantProject/ParticipantProjectSpeciesContext';
import { useOrganization } from 'src/providers/hooks';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesUpdateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { SpeciesService } from 'src/services';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

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
  const navigate = useNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const { projectId } = useParams<{ projectId: string }>();
  const { deliverableId } = useParams<{ deliverableId: string }>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const snackbar = useSnackbar();
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const { currentParticipantProjectSpecies, reload } = useParticipantProjectSpeciesData();
  const { currentDeliverable } = useDeliverableData();
  const [rationale, setRationale] = useState(currentParticipantProjectSpecies?.rationale || '');
  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectSpeciesUpdateRequest(requestId));
  const dispatch = useAppDispatch();

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const goToSpecies = (id?: number) => {
    if (speciesId) {
      const speciesLocation = {
        pathname: APP_PATHS.SPECIES_DETAILS.replace(':speciesId', speciesId.toString()),
      };
      navigate(speciesLocation);
    }
  };

  useEffect(() => {
    const getSpecies = async () => {
      const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization.id);
      if (speciesResponse.requestSucceeded) {
        setSpecies(speciesResponse.species);
      } else {
        navigate(APP_PATHS.SPECIES);
      }
    };
    if (selectedOrganization && speciesId) {
      getSpecies();
    }
  }, [speciesId, selectedOrganization, navigate]);

  useEffect(() => {
    setRecord({
      scientificName: species?.scientificName || '',
      commonName: species?.commonName,
      id: species?.id ?? -1,
      familyName: species?.familyName,
      conservationCategory: species?.conservationCategory,
      growthForms: species?.growthForms,
      seedStorageBehavior: species?.seedStorageBehavior,
      ecosystemTypes: species?.ecosystemTypes,
      rare: species?.rare,
    });
  }, [species, setRecord, selectedOrganization]);

  useEffect(() => {
    if (result?.status === 'success') {
      setIsBusy(false);
      if (currentParticipantProjectSpecies) {
        reload(currentParticipantProjectSpecies.id);
      }
      if (speciesId && projectId && deliverableId)
        navigate(
          APP_PATHS.ACCELERATOR_SPECIES.replace(':speciesId', speciesId)
            .replace(':projectId', projectId)
            .replace(':deliverableId', deliverableId)
        );
    } else if (result?.status === 'error') {
      setIsBusy(false);
      snackbar.toastError();
    }
  }, [result]);

  const saveSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.updateSpecies(record, selectedOrganization.id);
      if (response.requestSucceeded) {
        if (currentParticipantProjectSpecies) {
          const request = dispatch(
            requestUpdateParticipantProjectSpecies({
              participantProjectSpecies: {
                ...currentParticipantProjectSpecies,
                rationale,
              },
            })
          );
          setRequestId(request.requestId);
        }
      } else {
        setIsBusy(false);
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
          <Typography fontSize='14px' lineHeight='20px' fontWeight={400} color={theme.palette.TwClrTxt}>
            {strings.formatString(strings.DELIVERABLE_PROJECT, currentDeliverable?.projectName ?? '')}
          </Typography>
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
          <Grid item xs={12} paddingBottom={theme.spacing(2)}>
            <TextField
              label={strings.RATIONALE}
              id='rationale'
              type='text'
              value={rationale}
              onChange={(value) => setRationale(value as string)}
            />
          </Grid>
          <SpeciesDetailsForm
            gridSize={gridSize()}
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
