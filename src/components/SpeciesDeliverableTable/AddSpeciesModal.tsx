import React, { useEffect, useMemo, useState } from 'react';

import { Grid, useTheme } from '@mui/material';
import { SelectT } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { useOrganization } from 'src/providers';
import { useParticipantData } from 'src/providers/Participant/ParticipantContext';
import { requestCreateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesCreateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import { SpeciesService } from 'src/services';
import {
  ParticipantProjectSpecies,
  ParticipantProjectSpeciesRequest,
} from 'src/services/ParticipantProjectSpeciesService';
import strings from 'src/strings';
import { Species } from 'src/types/Species';
import useSnackbar from 'src/utils/useSnackbar';

export interface AddEditSubLocationProps {
  onClose: () => void;
  participantProjectSpecies: ParticipantProjectSpecies[];
  reload: () => void;
}

export default function AddSpeciesModal(props: AddEditSubLocationProps): JSX.Element {
  const { onClose, participantProjectSpecies, reload } = props;
  const { currentParticipantProject } = useParticipantData();
  const { selectedOrganization } = useOrganization();
  const [allSpecies, setAllSpecies] = useState<Species[]>();
  const [selectableSpecies, setSelectableSpecies] = useState<Species[]>();
  const [participantProjectSpeciesIds, setParticipantProjectSpeciesIds] = useState<number[]>();
  const [selectedSpecies, setSelectedSpecies] = useState<Species>();
  const [error, setError] = useState<string>('');
  const theme = useTheme();
  const [requestId, setRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectParticipantProjectSpeciesCreateRequest(requestId));
  const snackbar = useSnackbar();

  useMemo(() => {
    const ids = participantProjectSpecies.map((ppSpecies) => ppSpecies.id);
    setParticipantProjectSpeciesIds(ids);
  }, [participantProjectSpecies]);

  useEffect(() => {
    const populateSpecies = async () => {
      const response = await SpeciesService.getAllSpecies(selectedOrganization.id);
      if (response.requestSucceeded) {
        setAllSpecies(response.species);
      }
    };

    void populateSpecies();
  }, [selectedOrganization.id, location]);

  const initializeSpeciesProject = () => {
    if (currentParticipantProject) {
      return {
        projectId: currentParticipantProject.id,
        speciesId: -1,
      };
    }
  };

  useEffect(() => {
    const speciesToAdd = allSpecies?.filter((species) => {
      return !participantProjectSpeciesIds?.includes(species.id);
    });
    setSelectableSpecies(speciesToAdd);
  }, [allSpecies]);

  const [record] = useState<ParticipantProjectSpeciesRequest | undefined>(initializeSpeciesProject());

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      reload();
      onClose();
    }
  }, [result, snackbar]);

  const save = () => {
    if (selectedSpecies && record) {
      setError('');
      const newProjectSpecies = { ...record, speciesId: selectedSpecies.id };
      const request = dispatch(requestCreateParticipantProjectSpecies(newProjectSpecies));
      setRequestId(request.requestId);
    } else {
      setError(strings.REQUIRED_FIELD);
    }
  };
  const onChangeSpecies = (newSpecies: Species) => {
    setSelectedSpecies(newSpecies);
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
            selectedValue={selectedSpecies}
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
          <TextField id='rationale' label={strings.RATIONALE} type='textarea' value={record?.rationale} required />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
