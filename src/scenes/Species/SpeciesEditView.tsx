import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useOrganization } from 'src/providers/hooks';
import {
  requestAssignParticipantProjectSpecies,
  requestDeleteManyParticipantProjectSpecies,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import {
  selectParticipantProjectSpeciesAssignRequest,
  selectParticipantProjectSpeciesDeleteManyRequest,
} from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
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
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [record, setRecord, onChange] = useForm<Species>(initSpecies());
  const snackbar = useSnackbar();
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [addedProjectsIds, setAddedProjectsIds] = useState<number[]>();
  const [removedProjectsIds, setRemovedProjectsIds] = useState<number[]>();

  const [addRequestId, setAddRequestId] = useState<string>('');
  const [removeRequestId, setRemoveRequestId] = useState<string>('');
  const addedResult = useAppSelector(selectParticipantProjectSpeciesAssignRequest(addRequestId));
  const removedResult = useAppSelector(selectParticipantProjectSpeciesDeleteManyRequest(removeRequestId));
  const dispatch = useAppDispatch();

  const onRemoveExistingHandler = (removedIds: number[]) => {
    setRemovedProjectsIds(removedIds);
  };

  const onRemoveNewHandler = (removedIds: number[]) => {
    setAddedProjectsIds((oldProjectsIds: number[] | undefined) => {
      const newIds = oldProjectsIds?.filter((oPId) => !removedIds.includes(oPId));
      return newIds;
    });
  };

  const onAddHandler = (addedIds: number[]) => {
    setAddedProjectsIds((oldProjectsIds: number[] | undefined) => {
      return oldProjectsIds ? [...oldProjectsIds, ...addedIds] : addedIds;
    });
  };

  useEffect(() => {
    if (removedResult?.status === 'success') {
      goToSpecies(record.id);
    }
    if (addedResult?.status === 'success') {
      goToSpecies(record.id);
    }
  }, [addedResult, removedResult]);

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

  const saveSpecies = async () => {
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.updateSpecies(record, selectedOrganization.id);
      setIsBusy(false);
      if (response.requestSucceeded) {
        if (removedProjectsIds) {
          const request = dispatch(requestDeleteManyParticipantProjectSpecies(removedProjectsIds));
          setRemoveRequestId(request.requestId);
        }
        if (addedProjectsIds && speciesId) {
          const request = dispatch(
            requestAssignParticipantProjectSpecies({ projectIds: addedProjectsIds, speciesIds: [Number(speciesId)] })
          );
          setAddRequestId(request.requestId);
        }
        if ((!removedProjectsIds || !removedProjectsIds.length) && (!addedProjectsIds || !addedProjectsIds.length)) {
          goToSpecies(record.id);
        }
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
            record={record}
            onChange={onChange}
            setRecord={setRecord}
            nameFormatError={nameFormatError}
            setNameFormatError={setNameFormatError}
            onAdd={onAddHandler}
            onRemoveExisting={onRemoveExistingHandler}
            onRemoveNew={onRemoveNewHandler}
            addedProjectsIds={addedProjectsIds}
            removedProjectsIds={removedProjectsIds}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
