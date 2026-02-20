import React, { type JSX, useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';

import { Box, Typography, useTheme } from '@mui/material';
import { BusySpinner } from '@terraware/web-components';
import { DateTime } from 'luxon';

import PageSnackbar from 'src/components/PageSnackbar';
import PageForm from 'src/components/common/PageForm';
import TfMain from 'src/components/common/TfMain';
import { APP_PATHS } from 'src/constants';
import { useSyncNavigate } from 'src/hooks/useSyncNavigate';
import { useOrganization } from 'src/providers/hooks';
import {
  requestAddManyAcceleratorProjectSpecies,
  requestDeleteManyAcceleratorProjectSpecies,
} from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesAsyncThunks';
import {
  selectAcceleratorProjectSpeciesAddManyRequest,
  selectAcceleratorProjectSpeciesDeleteManyRequest,
} from 'src/redux/features/acceleratorProjectSpecies/acceleratorProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import SpeciesDetailsForm from 'src/scenes/Species/SpeciesDetailsForm';
import { SpeciesService } from 'src/services';
import { CreateAcceleratorProjectSpeciesRequestPayload } from 'src/services/AcceleratorProjectSpeciesService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useDeviceInfo from 'src/utils/useDeviceInfo';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import { ProjectSpecies } from './AddToProjectModal';

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

export default function SpeciesEditView(): JSX.Element {
  const theme = useTheme();
  const [species, setSpecies] = useState<Species>();
  const navigate = useSyncNavigate();
  const { isMobile } = useDeviceInfo();
  const { selectedOrganization } = useOrganization();
  const { speciesId } = useParams<{ speciesId: string }>();
  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [record, setRecord, , onChangeCallback] = useForm<Species>(initSpecies());
  const snackbar = useSnackbar();
  const [nameFormatError, setNameFormatError] = useState<string | string[]>('');
  const [addedProjectsSpecies, setAddedProjectsSpecies] = useState<ProjectSpecies[]>();
  const [removedProjectsIds, setRemovedProjectsIds] = useState<number[]>();

  const [addRequestId, setAddRequestId] = useState<string>('');
  const [removeRequestId, setRemoveRequestId] = useState<string>('');
  const addedResult = useAppSelector(selectAcceleratorProjectSpeciesAddManyRequest(addRequestId));
  const removedResult = useAppSelector(selectAcceleratorProjectSpeciesDeleteManyRequest(removeRequestId));
  const dispatch = useAppDispatch();

  const onRemoveExistingHandler = (removedIds: number[]) => {
    setRemovedProjectsIds(removedIds);
  };

  const onRemoveNewHandler = (removedIds: number[]) => {
    setAddedProjectsSpecies((oldProjectsSpecies: ProjectSpecies[] | undefined) => {
      const newProjectSpecies = oldProjectsSpecies?.filter((oPS) => !removedIds.includes(oPS.project.id));
      return newProjectSpecies;
    });
  };

  const onAddHandler = (addedProjectSpecies: ProjectSpecies[]) => {
    setAddedProjectsSpecies((oldProjectSpecies: ProjectSpecies[] | undefined) => {
      return oldProjectSpecies ? [...oldProjectSpecies, ...addedProjectSpecies] : addedProjectSpecies;
    });
  };

  const gridSize = () => {
    if (isMobile) {
      return 12;
    }
    return 4;
  };

  const goToSpecies = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (id?: number) => {
      if (speciesId) {
        const speciesLocation = {
          pathname: APP_PATHS.SPECIES_DETAILS.replace(':speciesId', speciesId.toString()),
        };
        navigate(speciesLocation);
      }
    },
    [navigate, speciesId]
  );

  useEffect(() => {
    if (removedResult?.status === 'success') {
      goToSpecies(record.id);
    }
    if (addedResult?.status === 'success') {
      goToSpecies(record.id);
    }
  }, [addedResult, goToSpecies, record.id, removedResult]);

  useEffect(() => {
    const getSpecies = async () => {
      const speciesResponse = await SpeciesService.getSpecies(Number(speciesId), selectedOrganization?.id || -1);
      if (speciesResponse.requestSucceeded) {
        setSpecies(speciesResponse.species);
      } else {
        navigate(APP_PATHS.SPECIES);
      }
    };
    if (selectedOrganization && speciesId) {
      void getSpecies();
    }
  }, [speciesId, selectedOrganization, navigate]);

  useEffect(() => {
    const now = DateTime.now().toISO();
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
      createdTime: species?.createdTime ?? now,
      modifiedTime: species?.modifiedTime ?? now,
    });
  }, [species, setRecord, selectedOrganization]);

  const saveSpecies = async () => {
    if (!selectedOrganization) {
      return;
    }
    if (!record.scientificName) {
      setNameFormatError(strings.REQUIRED_FIELD);
    } else {
      setIsBusy(true);
      const response = await SpeciesService.updateSpecies(record, selectedOrganization.id);
      setIsBusy(false);
      if (response.requestSucceeded) {
        if (removedProjectsIds) {
          const request = dispatch(requestDeleteManyAcceleratorProjectSpecies(removedProjectsIds));
          setRemoveRequestId(request.requestId);
        }
        if (addedProjectsSpecies && speciesId) {
          const createRequests = addedProjectsSpecies.map((aPS) => {
            return {
              projectId: aPS.project.id,
              speciesId: Number(speciesId),
              speciesNativeCategory: aPS.nativeCategory,
            } as CreateAcceleratorProjectSpeciesRequestPayload;
          });
          const request = dispatch(requestAddManyAcceleratorProjectSpecies(createRequests));
          setAddRequestId(request.requestId);
        }
        if (
          (!removedProjectsIds || !removedProjectsIds.length) &&
          (!addedProjectsSpecies || !addedProjectsSpecies.length)
        ) {
          goToSpecies(record.id);
        }
      } else if (response.statusCode === 409) {
        snackbar.toastError(strings.formatString(strings.EXISTING_SPECIES_MSG, record.scientificName));
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
        onSave={() => void saveSpecies()}
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
            onChange={onChangeCallback}
            setRecord={setRecord}
            nameFormatError={nameFormatError}
            setNameFormatError={setNameFormatError}
            onAdd={onAddHandler}
            onRemoveExisting={onRemoveExistingHandler}
            onRemoveNew={onRemoveNewHandler}
            addedProjectsSpecies={addedProjectsSpecies}
            removedProjectsIds={removedProjectsIds}
          />
        </Box>
      </PageForm>
    </TfMain>
  );
}
