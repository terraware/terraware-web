import React, { type JSX, useEffect, useState } from 'react';

import { Grid, Typography, useTheme } from '@mui/material';
import { Dropdown } from '@terraware/web-components';

import DialogBox from 'src/components/common/DialogBox/DialogBox';
import TextField from 'src/components/common/Textfield/Textfield';
import Button from 'src/components/common/button/Button';
import { APP_PATHS } from 'src/constants';
import { useLocalization } from 'src/providers';
import { requestUpdateParticipantProjectSpecies } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesAsyncThunks';
import { selectParticipantProjectSpeciesUpdateRequest } from 'src/redux/features/participantProjectSpecies/participantProjectSpeciesSelectors';
import { useAppDispatch, useAppSelector } from 'src/redux/store';
import strings from 'src/strings';
import {
  SpeciesForParticipantProject,
  SpeciesNativeCategory,
  getSpeciesNativeCategoryOptions,
} from 'src/types/ParticipantProjectSpecies';
import useForm from 'src/utils/useForm';
import useSnackbar from 'src/utils/useSnackbar';

import Link from '../common/Link';

export interface EditSpeciesModalProps {
  onClose: () => void;
  reload: () => void;
  projectSpecies: SpeciesForParticipantProject;
}

export default function EditSpeciesModal(props: EditSpeciesModalProps): JSX.Element {
  const { onClose, reload, projectSpecies } = props;
  const theme = useTheme();
  const [requestId, setRequestId] = useState<string>('');
  const dispatch = useAppDispatch();
  const result = useAppSelector(selectParticipantProjectSpeciesUpdateRequest(requestId));
  const snackbar = useSnackbar();

  const [error, setError] = useState('');
  const [record, setRecord] = useForm<SpeciesForParticipantProject>(projectSpecies);
  const { activeLocale } = useLocalization();

  useEffect(() => {
    if (result?.status === 'error') {
      snackbar.toastError();
    } else if (result?.status === 'success') {
      reload();
      onClose();
    }
  }, [result, snackbar, onClose, reload]);

  const save = () => {
    if (!record.participantProjectSpecies.rationale || !record?.participantProjectSpecies.speciesNativeCategory) {
      setError(strings.REQUIRED_FIELD);
      return;
    }

    const request = dispatch(
      requestUpdateParticipantProjectSpecies({
        participantProjectSpecies: record.participantProjectSpecies,
      })
    );
    setRequestId(request.requestId);
  };

  const onChangeRationale = (rationale: unknown) => {
    setRecord((prev) => {
      const previousParticipantProjectSpecies = { ...prev.participantProjectSpecies };
      previousParticipantProjectSpecies.rationale = rationale as string;
      return {
        ...prev,
        participantProjectSpecies: previousParticipantProjectSpecies,
      };
    });
  };

  const onChangeNativeCategory = (value: unknown) => {
    setRecord((prev) => {
      const previousParticipantProjectSpecies = { ...prev.participantProjectSpecies };
      previousParticipantProjectSpecies.speciesNativeCategory = value as SpeciesNativeCategory;
      return {
        ...prev,
        participantProjectSpecies: previousParticipantProjectSpecies,
      };
    });
  };

  return (
    <DialogBox
      onClose={onClose}
      open={true}
      title={strings.SPECIES_USAGE}
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
        <Button id='save' onClick={save} label={strings.SAVE} key='button-2' />,
      ]}
    >
      <Grid container textAlign={'left'}>
        <Grid item xs={12}>
          <Typography sx={{ fontSize: '14px', color: theme.palette.TwClrBaseGray600, marginBottom: 1.5 }}>
            {strings.SCIENTIFIC_NAME}
          </Typography>
          <Link
            fontSize='16px'
            to={APP_PATHS.SPECIES_DETAILS.replace(':speciesId', projectSpecies.species.id.toString())}
          >
            {projectSpecies.species.scientificName}
          </Link>
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <Dropdown
            id='speciesNativeCategory'
            selectedValue={record?.participantProjectSpecies.speciesNativeCategory}
            onChange={(value) => onChangeNativeCategory(value)}
            options={getSpeciesNativeCategoryOptions(activeLocale)}
            label={strings.NATIVE_NON_NATIVE}
            aria-label={strings.NATIVE_NON_NATIVE}
            placeholder={strings.SELECT}
            fixedMenu
            required
            fullWidth={true}
            errorText={error && !record?.participantProjectSpecies.speciesNativeCategory ? error : ''}
          />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: theme.spacing(2) }}>
          <TextField
            required
            id='rationale'
            label={strings.RATIONALE}
            type='textarea'
            value={record?.participantProjectSpecies.rationale}
            onChange={onChangeRationale}
            errorText={error && !record?.participantProjectSpecies.rationale ? error : ''}
          />
        </Grid>
      </Grid>
    </DialogBox>
  );
}
