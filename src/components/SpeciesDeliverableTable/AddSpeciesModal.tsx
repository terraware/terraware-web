import React, { useEffect, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestCreateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesCreateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { selectSpecies } from 'src/redux/features/species/speciesSelectors';
import { requestSpecies } from 'src/redux/features/species/speciesThunks';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import {
  CreateParticipantProjectSpeciesRequestPayload,
  SpeciesWithParticipantProjectsSearchResponse,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

export interface AddEditSubLocationProps {
  onClose: () => void;
  participantProjectSpecies: SpeciesWithParticipantProjectsSearchResponse[];
  projectId: number;
  reload: () => void;
}

export default function AddSpeciesModal(props: AddEditSubLocationProps): JSX.Element {
  const { onClose, participantProjectSpecies, reload, projectId } = props;

  const dispatch = useAppDispatch();
  const snackbar = useSnackbar();
  const { currentParticipantProject } = useParticipantData();
  const { selectedOrganization } = useOrganization();
  const theme = useTheme();

  const allSpecies = useAppSelector(selectSpecies);

  const [requestId, setRequestId] = useState<string>('');
  const result = useAppSelector(selectParticipantProjectSpeciesCreateRequest(requestId));

  const [selectableSpecies, setSelectableSpecies] = useState<Species[]>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const speciesToAdd = allSpecies?.filter((species) => {
      return !participantProjectSpecies?.find((_species) => species.id === _species.id);
    });
    setSelectableSpecies(speciesToAdd);
  }, [allSpecies, participantProjectSpecies]);

  const [record, setRecord] = useState<Partial<CreateParticipantProjectSpeciesRequestPayload>>({});

  useEffect(() => {
    if (!allSpecies) {
      dispatch(requestSpecies(selectedOrganization.id));
    }
  }, [allSpecies, selectedOrganization]);

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      reload();
      onClose();
    }
  }, [result, snackbar]);

  useEffect(() => {
    setRecord((prev) => ({
      ...prev,
      projectId: projectId,
    }));
  }, []);

  const save = () => {
    const payload: CreateParticipantProjectSpeciesRequestPayload = {
      ...record,
    } as CreateParticipantProjectSpeciesRequestPayload;

    if (!payload || !payload.projectId || !payload.rationale || !payload.speciesId) {
      setError(strings.REQUIRED_FIELD);
      return;
    }

    setError('');
    const request = dispatch(requestCreateParticipantProjectSpecies(payload));
    setRequestId(request.requestId);
  };

  const onChangeSpecies = (newSpecies: Species) => {
    setRecord((prev) => ({
      ...prev,
      speciesId: newSpecies.id,
    }));
  };

  const onChangeRationale = (rationale: unknown) => {
    setRecord((prev) => ({
      ...prev,
      rationale: `${rationale}`,
    }));
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.ADD_SPECIES_TO_PROJECT}
      size='large'
      middleButtons={[
        <Button
          id='cancel'
          label={strings.CANCEL}
          type='passive'
          onClick={onClose}
          priority='secondary'
          key='button-1'
        />,
        <Button id='save' onClick={save} label={strings.ADD_TO_PROJECT} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <TextField
            id='project-name'
            label={strings.NAME}
            type='text'
            display={true}
            value={currentParticipantProject?.name}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <SelectT<Species>
            id='scientificName'
            label={strings.SCIENTIFIC_NAME}
            placeholder={strings.SELECT}
            options={selectableSpecies}
            onChange={onChangeSpecies}
            selectedValue={allSpecies?.find((_species) => record?.speciesId === _species.id)}
            fullWidth={true}
            isEqual={(a: Species, b: Species) => a.id === b.id}
            renderOption={(species: Species) => species?.scientificName || ''}
            displayLabel={(species: Species) => species?.scientificName || ''}
            toT={(scientificName: string) => ({ scientificName }) as Species}
            required
            errorText={error}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <TextField
            id='rationale'
            label={strings.RATIONALE}
            type='textarea'
            value={record?.rationale}
            onChange={onChangeRationale}
            errorText={error && !record?.rationale ? strings.REQUIRED_FIELD : ''}
            required
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
